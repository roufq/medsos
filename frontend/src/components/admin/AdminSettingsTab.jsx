import React, { useState } from 'react';

const AdminSettingsTab = () => {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="w-full">
      <div className="max-w-[1100px] mx-auto">
        <header className="mb-10">
          <h2 className="font-display-lg text-display-lg text-text-primary mb-2">Platform Settings</h2>
          <p className="text-text-secondary font-body-md text-body-md max-w-2xl">
            Manage your application's global configuration, security protocols, and third-party integrations.
          </p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <nav className="md:col-span-3 space-y-1.5" id="settings-tabs">
            <button
              onClick={() => setActiveTab('general')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === 'general'
                  ? 'bg-surface-container-lowest shadow-sm border border-primary/20 text-primary font-bold'
                  : 'text-secondary hover:bg-surface-container-low'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">tune</span>
              <span className="text-label-md">General</span>
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === 'security'
                  ? 'bg-surface-container-lowest shadow-sm border border-primary/20 text-primary font-bold'
                  : 'text-secondary hover:bg-surface-container-low'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">shield</span>
              <span className="text-label-md">Security</span>
            </button>
            <button
              onClick={() => setActiveTab('storage')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === 'storage'
                  ? 'bg-surface-container-lowest shadow-sm border border-primary/20 text-primary font-bold'
                  : 'text-secondary hover:bg-surface-container-low'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">cloud_queue</span>
              <span className="text-label-md">Storage</span>
            </button>
          </nav>

          <div className="md:col-span-9">
            {/* General Settings */}
            {activeTab === 'general' && (
              <section className="bg-surface-card p-8 rounded-2xl shadow-sm border border-border-subtle animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">tune</span>
                  </div>
                  <div>
                    <h3 className="font-headline-md text-headline-md">General Configuration</h3>
                    <p className="text-label-sm text-text-secondary">Basic platform identity and contact information.</p>
                  </div>
                </div>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="font-label-md text-on-surface-variant block">Site Name</label>
                      <input
                        type="text"
                        defaultValue="Connect Modern"
                        className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-transparent focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary text-body-md transition-all outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-label-md text-on-surface-variant block">Contact Email</label>
                      <input
                        type="email"
                        defaultValue="admin@connectmodern.com"
                        className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-transparent focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary text-body-md transition-all outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="font-label-md text-on-surface-variant block">Platform Description</label>
                    <textarea
                      rows="4"
                      defaultValue="The next-generation social ecosystem for professional networking and digital expression."
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-transparent focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary text-body-md transition-all outline-none"
                    ></textarea>
                  </div>
                  <div className="flex items-center justify-between p-5 bg-surface-container-lowest rounded-2xl border border-border-subtle shadow-sm">
                    <div>
                      <p className="font-label-md text-text-primary">Maintenance Mode</p>
                      <p className="text-label-sm text-text-secondary">Disable public access for scheduled updates.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                    </label>
                  </div>
                  <div className="pt-6 flex justify-end gap-4 border-t border-border-subtle">
                    <button type="button" className="px-6 py-2.5 rounded-xl text-secondary font-bold hover:bg-surface-container-low transition-colors">
                      Discard
                    </button>
                    <button type="button" className="px-8 py-2.5 rounded-xl bg-primary text-on-primary font-bold shadow-md hover:brightness-110 transition-all active:scale-95">
                      Save Changes
                    </button>
                  </div>
                </form>
              </section>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <section className="bg-surface-card p-8 rounded-2xl shadow-sm border border-border-subtle animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-error/10 rounded-2xl flex items-center justify-center text-error">
                    <span className="material-symbols-outlined">shield</span>
                  </div>
                  <div>
                    <h3 className="font-headline-md text-headline-md">Security & Authentication</h3>
                    <p className="text-label-sm text-text-secondary">Configure JWT secrets and session lifecycle parameters.</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="font-label-md text-on-surface-variant block">JWT Secret Key</label>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        defaultValue="••••••••••••••••••••••••••••"
                        className="flex-1 px-4 py-2.5 rounded-xl bg-surface-container-low border border-transparent focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary text-body-md transition-all font-mono outline-none"
                      />
                      <button className="p-2.5 rounded-xl border border-border-subtle hover:bg-surface-container-low transition-colors">
                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                      </button>
                      <button className="p-2.5 rounded-xl border border-border-subtle hover:bg-surface-container-low transition-colors">
                        <span className="material-symbols-outlined text-[20px]">refresh</span>
                      </button>
                    </div>
                    <p className="text-label-sm text-text-secondary">Changing this will invalidate all active user sessions.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="font-label-md text-on-surface-variant block">Session Timeout (Minutes)</label>
                      <input
                        type="number"
                        defaultValue="1440"
                        className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-transparent focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary text-body-md transition-all outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-label-md text-on-surface-variant block">Password Complexity</label>
                      <select
                        className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-transparent focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary text-body-md transition-all outline-none appearance-none"
                        defaultValue="enterprise"
                      >
                        <option value="standard">Standard (8+ chars)</option>
                        <option value="enterprise">Enterprise (Special, Num, Mixed Case)</option>
                        <option value="strict">Strict (Biometric Only)</option>
                      </select>
                    </div>
                  </div>
                  <div className="p-5 bg-tertiary-fixed rounded-2xl border border-tertiary-container/10 flex gap-4">
                    <span className="material-symbols-outlined text-tertiary">warning</span>
                    <div>
                      <p className="font-label-md text-tertiary">Security Protocol</p>
                      <p className="text-label-sm text-tertiary-container leading-relaxed">
                        Ensure your SSL certificates are updated before changing JWT parameters to prevent man-in-the-middle exploits.
                      </p>
                    </div>
                  </div>
                  <div className="pt-6 flex justify-end gap-4 border-t border-border-subtle">
                    <button type="button" className="px-8 py-2.5 rounded-xl bg-primary text-on-primary font-bold shadow-md hover:brightness-110 transition-all active:scale-95">
                      Update Security
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* Storage Settings */}
            {activeTab === 'storage' && (
              <section className="bg-surface-card p-8 rounded-2xl shadow-sm border border-border-subtle animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-success/10 rounded-2xl flex items-center justify-center text-success">
                    <span className="material-symbols-outlined">cloud_queue</span>
                  </div>
                  <div>
                    <h3 className="font-headline-md text-headline-md">Cloud Storage Integration</h3>
                    <p className="text-label-sm text-text-secondary">Configure AWS S3 or Cloudinary for media assets.</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex gap-2 p-1 bg-surface-container-low rounded-xl mb-6">
                    <button className="flex-1 py-2 text-label-md font-bold bg-white shadow-sm rounded-lg text-primary border border-primary/10">
                      AWS S3
                    </button>
                    <button className="flex-1 py-2 text-label-md font-bold text-secondary hover:bg-white/50 rounded-lg transition-all">
                      Cloudinary
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="font-label-md text-on-surface-variant block">Access Key ID</label>
                      <input
                        type="text"
                        placeholder="AKIA..."
                        className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-transparent focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary text-body-md transition-all outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-label-md text-on-surface-variant block">Secret Access Key</label>
                      <input
                        type="password"
                        placeholder="••••••••••••"
                        className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-transparent focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary text-body-md transition-all outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="font-label-md text-on-surface-variant block">Bucket Region</label>
                      <input
                        type="text"
                        defaultValue="us-east-1"
                        className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-transparent focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary text-body-md transition-all outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-label-md text-on-surface-variant block">Bucket Name</label>
                      <input
                        type="text"
                        defaultValue="connect-modern-assets"
                        className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-transparent focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary text-body-md transition-all outline-none"
                      />
                    </div>
                  </div>
                  <div className="pt-6 flex justify-end gap-4 border-t border-border-subtle">
                    <button type="button" className="px-6 py-2.5 rounded-xl text-primary font-bold border border-primary/20 hover:bg-primary/5 transition-colors">
                      Test Connection
                    </button>
                    <button type="button" className="px-8 py-2.5 rounded-xl bg-primary text-on-primary font-bold shadow-md hover:brightness-110 transition-all active:scale-95">
                      Save Credentials
                    </button>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsTab;
