import React, { useState, useEffect } from 'react';
import { Clock, Play, Pause, Trash2, Edit, Plus, Calendar, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface ScanSchedule {
  id: string;
  name: string;
  provider: string;
  regions: string[];
  filters: Record<string, any>;
  schedule: string;
  enabled: boolean;
  last_run?: string;
  next_run?: string;
  created_at: string;
  updated_at: string;
}

interface CronJob {
  id: string;
  name: string;
  schedule: string;
  provider: string;
  regions: string[];
  filters: Record<string, any>;
  enabled: boolean;
  status: 'active' | 'paused' | 'failed';
  last_run?: string;
  next_run?: string;
  created_at: string;
  updated_at: string;
}

export const Scheduler: React.FC = () => {
  const [schedules, setSchedules] = useState<ScanSchedule[]>([]);
  const [cronJobs, setCronJobs] = useState<CronJob[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScanSchedule | null>(null);

  const providers = [
    { id: 'aws', name: 'Amazon Web Services', icon: '☁️', color: 'bg-orange-100 text-orange-800' },
    { id: 'azure', name: 'Microsoft Azure', icon: '🔷', color: 'bg-blue-100 text-blue-800' },
    { id: 'gcp', name: 'Google Cloud Platform', icon: '🔵', color: 'bg-green-100 text-green-800' },
    { id: 'kubernetes', name: 'Kubernetes', icon: '⚙️', color: 'bg-purple-100 text-purple-800' }
  ];

  const schedulePresets = [
    { name: 'Every 6 hours', cron: '0 */6 * * *', description: 'High frequency monitoring' },
    { name: 'Daily at 2 AM', cron: '0 2 * * *', description: 'Daily inventory scan' },
    { name: 'Weekly on Sunday', cron: '0 3 * * 0', description: 'Weekly comprehensive scan' },
    { name: 'Monthly on 1st', cron: '0 0 1 * *', description: 'Monthly compliance check' },
  ];

  useEffect(() => {
    loadSchedules();
    loadCronJobs();
  }, []);

  const loadSchedules = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/scheduler/schedules');
      const data = await response.json();
      setSchedules(data.schedules || []);
    } catch (error) {
      console.error('Failed to load schedules:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCronJobs = async () => {
    try {
      const response = await fetch('/api/v1/scheduler/cronjobs');
      const data = await response.json();
      setCronJobs(data.cron_jobs || []);
    } catch (error) {
      console.error('Failed to load cron jobs:', error);
    }
  };

  const createSchedule = async (schedule: Partial<ScanSchedule>) => {
    try {
      const response = await fetch('/api/v1/scheduler/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(schedule)
      });

      if (response.ok) {
        loadSchedules();
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error('Failed to create schedule:', error);
    }
  };

  const updateSchedule = async (id: string, updates: Partial<ScanSchedule>) => {
    try {
      const response = await fetch(`/api/v1/scheduler/schedules/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        loadSchedules();
        setEditingSchedule(null);
      }
    } catch (error) {
      console.error('Failed to update schedule:', error);
    }
  };

  const deleteSchedule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;

    try {
      const response = await fetch(`/api/v1/scheduler/schedules/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        loadSchedules();
      }
    } catch (error) {
      console.error('Failed to delete schedule:', error);
    }
  };

  const triggerScan = async (provider: string, regions: string[], filters: Record<string, any>) => {
    try {
      const response = await fetch('/api/v1/scheduler/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'manual',
          provider,
          regions,
          filters,
          triggered_by: 'user',
          triggered_at: new Date().toISOString()
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Scan triggered successfully! Scan ID: ${result.scan_id}`);
      }
    } catch (error) {
      console.error('Failed to trigger scan:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatCronExpression = (cron: string) => {
    const presets = schedulePresets.find(p => p.cron === cron);
    return presets ? presets.name : cron;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display font-semibold text-niyama-black">
            Scheduled Scanning
          </h1>
          <p className="mt-2 text-body text-niyama-gray-600">
            Manage automated cloud resource scanning and drift detection
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-niyama-accent border-2 border-niyama-black rounded hover:bg-niyama-accent-dark transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Schedule
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Scan Schedules */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Scan Schedules</h3>
            <p className="card-description">
              Automated cloud resource scanning schedules
            </p>
          </div>
          <div className="card-content">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : schedules.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No schedules configured</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-2 text-blue-600 hover:text-blue-800"
                >
                  Create your first schedule
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {schedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="p-4 border-2 border-gray-200 rounded hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium text-gray-900">{schedule.name}</h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded border ${
                            schedule.enabled ? 'bg-green-100 text-green-800 border-green-300' : 'bg-gray-100 text-gray-800 border-gray-300'
                          }`}>
                            {schedule.enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-2">
                          <div className="flex items-center space-x-4">
                            <span>{schedule.provider.toUpperCase()}</span>
                            <span>{schedule.regions.join(', ')}</span>
                            <span>{formatCronExpression(schedule.schedule)}</span>
                          </div>
                        </div>

                        {schedule.last_run && (
                          <div className="text-xs text-gray-500">
                            Last run: {new Date(schedule.last_run).toLocaleString()}
                          </div>
                        )}
                        {schedule.next_run && (
                          <div className="text-xs text-gray-500">
                            Next run: {new Date(schedule.next_run).toLocaleString()}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => triggerScan(schedule.provider, schedule.regions, schedule.filters)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                          title="Trigger now"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEditingSchedule(schedule)}
                          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteSchedule(schedule.id)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Kubernetes CronJobs */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Kubernetes CronJobs</h3>
            <p className="card-description">
              Active Kubernetes CronJob deployments
            </p>
          </div>
          <div className="card-content">
            {cronJobs.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No CronJobs deployed</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cronJobs.map((cronJob) => (
                  <div
                    key={cronJob.id}
                    className="p-4 border-2 border-gray-200 rounded hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium text-gray-900">{cronJob.name}</h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded border ${getStatusColor(cronJob.status)}`}>
                            {getStatusIcon(cronJob.status)} {cronJob.status.toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-2">
                          <div className="flex items-center space-x-4">
                            <span>{cronJob.provider.toUpperCase()}</span>
                            <span>{cronJob.regions.join(', ')}</span>
                            <span>{formatCronExpression(cronJob.schedule)}</span>
                          </div>
                        </div>

                        {cronJob.last_run && (
                          <div className="text-xs text-gray-500">
                            Last run: {new Date(cronJob.last_run).toLocaleString()}
                          </div>
                        )}
                        {cronJob.next_run && (
                          <div className="text-xs text-gray-500">
                            Next run: {new Date(cronJob.next_run).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Schedule Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white border-2 border-niyama-black rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingSchedule ? 'Edit Schedule' : 'Create Schedule'}
            </h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const schedule = {
                name: formData.get('name'),
                provider: formData.get('provider'),
                regions: [formData.get('regions')],
                schedule: formData.get('schedule'),
                enabled: formData.get('enabled') === 'on'
              };
              
              if (editingSchedule) {
                updateSchedule(editingSchedule.id, schedule);
              } else {
                createSchedule(schedule);
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Schedule Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingSchedule?.name || ''}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded focus:border-niyama-black focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Provider
                  </label>
                  <select
                    name="provider"
                    defaultValue={editingSchedule?.provider || ''}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded focus:border-niyama-black focus:outline-none"
                    required
                  >
                    <option value="">Select Provider</option>
                    {providers.map((provider) => (
                      <option key={provider.id} value={provider.id}>
                        {provider.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Regions
                  </label>
                  <input
                    type="text"
                    name="regions"
                    defaultValue={editingSchedule?.regions.join(', ') || ''}
                    placeholder="us-east-1, us-west-2"
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded focus:border-niyama-black focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Schedule
                  </label>
                  <select
                    name="schedule"
                    defaultValue={editingSchedule?.schedule || ''}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded focus:border-niyama-black focus:outline-none"
                    required
                  >
                    <option value="">Select Schedule</option>
                    {schedulePresets.map((preset) => (
                      <option key={preset.cron} value={preset.cron}>
                        {preset.name} - {preset.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="enabled"
                    defaultChecked={editingSchedule?.enabled ?? true}
                    className="h-4 w-4 text-niyama-accent border-2 border-gray-300 rounded focus:ring-niyama-accent"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Enable schedule
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingSchedule(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border-2 border-gray-300 rounded hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-niyama-accent border-2 border-niyama-black rounded hover:bg-niyama-accent-dark transition-colors"
                >
                  {editingSchedule ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

