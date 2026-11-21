package notify

import (
	"bufio"
	"fmt"
	"github.com/stretchr/testify/require"
	"net"
	"strings"
	"testing"
	"time"
)

func TestSMTPDeliveryUsesLocalServerAndSanitizesHeaders(t *testing.T) {
	listener, err := net.Listen("tcp", "127.0.0.1:0")
	require.NoError(t, err)
	defer listener.Close()
	message := make(chan string, 1)
	go func() {
		connection, err := listener.Accept()
		if err != nil {
			return
		}
		defer connection.Close()
		connection.SetDeadline(time.Now().Add(5 * time.Second))
		reader := bufio.NewReader(connection)
		fmt.Fprint(connection, "220 localhost ready\r\n")
		for {
			line, err := reader.ReadString('\n')
			if err != nil {
				return
			}
			switch {
			case strings.HasPrefix(line, "EHLO"), strings.HasPrefix(line, "HELO"), strings.HasPrefix(line, "MAIL"), strings.HasPrefix(line, "RCPT"):
				fmt.Fprint(connection, "250 OK\r\n")
			case strings.HasPrefix(line, "AUTH"):
				fmt.Fprint(connection, "235 authenticated\r\n")
			case strings.HasPrefix(line, "DATA"):
				fmt.Fprint(connection, "354 send message\r\n")
				var body strings.Builder
				for {
					part, err := reader.ReadString('\n')
					if err != nil {
						return
					}
					if part == ".\r\n" {
						break
					}
					body.WriteString(part)
				}
				message <- body.String()
				fmt.Fprint(connection, "250 accepted\r\n")
			case strings.HasPrefix(line, "QUIT"):
				fmt.Fprint(connection, "221 bye\r\n")
				return
			default:
				return
			}
		}
	}()
	host, port, err := net.SplitHostPort(listener.Addr().String())
	require.NoError(t, err)
	t.Setenv("MAIL_HOST", host)
	t.Setenv("MAIL_PORT", port)
	t.Setenv("MAIL_USERNAME", "smtp-test")
	t.Setenv("MAIL_PASSWORD", "test-only")
	t.Setenv("MAIL_FROM_ADDRESS", "admin@example.test")
	require.NoError(t, SendMessageEmail("user@example.test", "Hello\r\nInjected", "Test body"))
	select {
	case body := <-message:
		require.Contains(t, body, "Subject: HelloInjected\r\n")
		require.Contains(t, body, "Test body")
	case <-time.After(5 * time.Second):
		t.Fatal("message not received")
	}
}
