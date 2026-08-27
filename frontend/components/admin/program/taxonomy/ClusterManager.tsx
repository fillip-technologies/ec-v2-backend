'use client';

import React, { useState } from 'react';
import { Boxes, Plus, X } from 'lucide-react';
import { DomainCluster, ProgramTopic } from '@/types/catalog';
import { createCluster } from '@/lib/api/catalog';

interface ClusterManagerProps {
  clusters: DomainCluster[];
  topics: ProgramTopic[];
  selectedTopicIds: number[];
  onClustersUpdated: (clusters: DomainCluster[]) => void;
}

export const ClusterManager: React.FC<ClusterManagerProps> = ({
  clusters,
  topics,
  selectedTopicIds,
  onClustersUpdated,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClusterName, setNewClusterName] = useState('');
  const [newClusterSlug, setNewClusterSlug] = useState('');
  const [newClusterDesc, setNewClusterDesc] = useState('');
  const [creatingCluster, setCreatingCluster] = useState(false);

  // Compute which clusters have topics that are currently selected in the program
  const activeClusterIds = new Set<number>();
  topics.forEach((t) => {
    if (selectedTopicIds.includes(t.id) && t.clusterId) {
      activeClusterIds.add(t.clusterId);
    }
  });

  const handleCreateCluster = async () => {
    if (!newClusterName.trim()) return;
    try {
      setCreatingCluster(true);
      const res = await createCluster({
        name: newClusterName.trim(),
        slug:
          newClusterSlug.trim() ||
          newClusterName
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-'),
        description: newClusterDesc.trim(),
      });

      const updated = [...clusters, res];
      onClustersUpdated(updated);
      setNewClusterName('');
      setNewClusterSlug('');
      setNewClusterDesc('');
      setShowAddModal(false);
      setCreatingCluster(false);
    } catch (err: any) {
      setCreatingCluster(false);
      alert(err.message || 'Failed to create cluster');
    }
  };

  return (
    <div className="space-y-3 pb-2 border-b border-borderLight/60">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold text-textPrimary flex items-center gap-1.5">
            <Boxes className="h-3.5 w-3.5 text-success" />
            Domain Clusters ({clusters.length})
          </span>
          {activeClusterIds.size > 0 && (
            <span className="px-2 py-0.5 rounded-md bg-statusPassedBg text-statusPassedText text-[10px] font-black">
              {activeClusterIds.size} active
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(!showAddModal)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-success hover:underline cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add New Cluster</span>
        </button>
      </div>

      {/* Inline Add Cluster Form */}
      {showAddModal && (
        <div className="p-4 rounded-2xl bg-successLight/60 border border-successBorder space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-successDark">Create New Domain Cluster</span>
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="text-textMuted hover:text-textPrimary"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold text-textMuted block mb-1">Cluster Name *</label>
              <input
                type="text"
                placeholder="e.g. Artificial Intelligence & ML"
                value={newClusterName}
                onChange={(e) => {
                  setNewClusterName(e.target.value);
                  setNewClusterSlug(
                    e.target.value
                      .toLowerCase()
                      .trim()
                      .replace(/[^a-z0-9\s-]/g, '')
                      .replace(/\s+/g, '-')
                  );
                }}
                className="w-full rounded-xl bg-white px-3 py-2 text-xs font-bold text-textPrimary border border-borderLight"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-textMuted block mb-1">Cluster Slug *</label>
              <input
                type="text"
                placeholder="artificial-intelligence-ml"
                value={newClusterSlug}
                onChange={(e) => setNewClusterSlug(e.target.value)}
                className="w-full rounded-xl bg-white px-3 py-2 text-xs font-bold text-textPrimary border border-borderLight"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-textMuted block mb-1">Description (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Advanced AI, LLMs, Computer Vision"
                value={newClusterDesc}
                onChange={(e) => setNewClusterDesc(e.target.value)}
                className="w-full rounded-xl bg-white px-3 py-2 text-xs font-bold text-textPrimary border border-borderLight"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-3 py-1.5 rounded-lg bg-white text-textPrimary text-xs font-bold border border-borderLight"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateCluster}
              disabled={creatingCluster || !newClusterName.trim()}
              className="px-4 py-1.5 rounded-lg bg-success text-white text-xs font-black hover:bg-successDark disabled:opacity-50"
            >
              {creatingCluster ? 'Creating...' : 'Save Cluster'}
            </button>
          </div>
        </div>
      )}

      {/* Cluster Badges with Automatic Highlight */}
      <div className="flex flex-wrap gap-2">
        {clusters.map((cl) => {
          const isHighlighted = activeClusterIds.has(cl.id);
          const selectedCountInCluster = topics.filter(
            (t) => selectedTopicIds.includes(t.id) && t.clusterId === cl.id
          ).length;

          return (
            <span
              key={cl.id}
              className={`px-3.5 py-1.5 rounded-xl text-xs transition-all flex items-center gap-2 ${
                isHighlighted
                  ? 'bg-success text-white font-black shadow-sm ring-2 ring-success/40 scale-[1.02]'
                  : 'bg-bgSoft border border-borderLight text-textMuted font-bold'
              }`}
              title={
                isHighlighted
                  ? `${selectedCountInCluster} topic(s) selected from this cluster`
                  : cl.description || cl.name
              }
            >
              <Boxes className={`h-3.5 w-3.5 ${isHighlighted ? 'text-white' : 'text-success'}`} />
              <span>{cl.name}</span>
              {isHighlighted && (
                <span className="px-1.5 py-0.5 rounded-md bg-white/25 text-white text-[10px] font-black">
                  {selectedCountInCluster} active
                </span>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
};
