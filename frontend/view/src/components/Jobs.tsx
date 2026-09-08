import { useState } from 'react';
import { Briefcase, MapPin, DollarSign, Calendar, Search, CheckCircle } from 'lucide-react';
import { mockJobs } from '../data';
import { Job } from '../types';

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);

  const handleApply = (jobId: string) => {
    if (appliedJobIds.includes(jobId)) return;
    setAppliedJobIds(prev => [...prev, jobId]);
  };

  const filteredJobs = jobs.filter(job => {
    const term = searchQuery.toLowerCase();
    const typeMatch = selectedType === 'All' || job.type === selectedType;
    const searchMatch = 
      job.title.toLowerCase().includes(term) ||
      job.company.toLowerCase().includes(term) ||
      job.description.toLowerCase().includes(term) ||
      job.category.toLowerCase().includes(term) ||
      job.location.toLowerCase().includes(term);
    return typeMatch && searchMatch;
  });

  return (
    <div className="flex-1 max-w-4xl mx-auto py-4 select-none">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column Stats & Quick Filters */}
        <div className="md:col-span-1 flex flex-col gap-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-2xl p-6 border border-border-subtle/50 shadow-sm flex flex-col gap-5">
            <h3 className="font-bold text-text-primary text-base border-b border-border-subtle/10 pb-3">Jobs Center</h3>
            <div className="flex justify-between items-center text-sm">
              <span className="text-text-secondary font-medium">Applied Roles</span>
              <span className="font-bold text-success bg-success/10 px-2.5 py-1 rounded-lg text-xs">
                {appliedJobIds.length}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-text-secondary font-medium">Available Openings</span>
              <span className="font-bold text-primary bg-secondary-container px-2.5 py-1 rounded-lg text-xs">
                {jobs.length}
              </span>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="bg-white rounded-2xl p-6 border border-border-subtle/50 shadow-sm flex flex-col gap-4">
            <h3 className="font-bold text-xs text-outline uppercase tracking-wider pl-1">Filters By Job Type</h3>
            <div className="flex flex-col gap-2 font-medium text-sm">
              {['All', 'Full-time', 'Part-time', 'Contract', 'Remote'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                    selectedType === type 
                      ? 'bg-secondary-container text-primary font-bold' 
                      : 'text-text-secondary hover:bg-surface-container-low hover:text-text-primary'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Central columns lists of roles */}
        <div className="md:col-span-2 flex flex-col gap-6 animate-fadeIn">
          
          {/* Top Search bar wrapper */}
          <div className="bg-white p-4 rounded-2xl border border-border-subtle/50 shadow-sm flex items-center pr-2">
            <Search className="w-5 h-5 text-outline ml-2" />
            <input 
              type="text"
              placeholder="Search current opportunities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none focus:ring-0 text-sm ml-3 w-full text-text-primary"
            />
          </div>

          {/* Jobs Listing Grid */}
          <div className="flex flex-col gap-4">
            {filteredJobs.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-border-subtle/40 text-center shadow-xs">
                <p className="text-sm font-semibold text-text-secondary">No openings found matching your parameters.</p>
                <p className="text-xs text-outline mt-1">Try resetting the type filter or clear the search query.</p>
              </div>
            ) : (
              filteredJobs.map((job) => {
                const hasApplied = appliedJobIds.includes(job.id);
                return (
                  <div 
                    key={job.id}
                    className="bg-white p-6 rounded-2xl border border-border-subtle/40 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-primary transition-all relative"
                  >
                    <div>
                      {/* Logo, title, company header */}
                      <div className="flex gap-4 items-start pb-4 border-b border-border-subtle/10 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-surface-container overflow-hidden flex-shrink-0 border border-border-subtle/20 flex items-center justify-center">
                          <img src={job.logo} alt={job.company} className="w-10 h-10 object-cover rounded-md" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-text-primary text-base leading-tight truncate">{job.title}</h4>
                          <p className="text-xs font-semibold text-primary">{job.company}</p>
                        </div>
                      </div>

                      {/* Info pills */}
                      <div className="flex flex-wrap gap-2.5 mb-4">
                        <span className="bg-surface-container-low border border-border-subtle/10 text-text-secondary px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{job.location}</span>
                        </span>
                        <span className="bg-surface-container-low border border-border-subtle/10 text-success px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>{job.salary}</span>
                        </span>
                        <span className="bg-secondary-container text-primary px-2.5 py-1 rounded-lg text-xs font-bold">
                          {job.type}
                        </span>
                      </div>

                      <p className="text-xs text-text-secondary leading-relaxed mb-6">{job.description}</p>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-border-subtle/10 mt-auto select-none">
                      <span className="text-[11px] text-outline flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Posted {job.postedTime}
                      </span>
                      {hasApplied ? (
                        <div className="bg-success text-white px-5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 animate-fadeIn">
                          <CheckCircle className="w-4 h-4 fill-current" />
                          <span>Applied</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleApply(job.id)}
                          className="bg-primary text-white hover:brightness-110 font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm shadow-primary/10 active:scale-95"
                        >
                          Quick Apply
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
