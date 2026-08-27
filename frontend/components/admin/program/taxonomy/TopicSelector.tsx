'use client';

import React, { useState, useMemo } from 'react';
import { Plus, X, Search } from 'lucide-react';
import { Cluster, Topic } from '@/types/catalog';
import { createTopic } from '@/lib/api/catalog';
import { CustomDropdown } from '@/components/shared/CustomDropdown';

interface TopicSelectorProps {
  topics: Topic[];
  setTopics: React.Dispatch<React.SetStateAction<Topic[]>>;
  clusters: Cluster[];
  selectedTopicIds: number[];
  onToggleTopic: (topicId: number) => void;
  onOpenAddClusterModal: () => void;
}

export const TopicSelector: React.FC<TopicSelectorProps> = ({
  topics,
  setTopics,
  clusters,
  selectedTopicIds,
  onToggleTopic,
  onOpenAddClusterModal,
}) => {
  const [topicSearch, setTopicSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicSlug, setNewTopicSlug] = useState('');
  const [newTopicClusterId, setNewTopicClusterId] = useState<number>(clusters[0]?.id || 1);
  const [creatingTopic, setCreatingTopic] = useState(false);

  const filteredTopics = useMemo(() => {
    const q = topicSearch.trim().toLowerCase();
    if (!q) return topics;
    return topics.filter((t) => {
      const parentCluster = clusters.find((c) => c.id === t.clusterId);
      return (
        t.name.toLowerCase().includes(q) ||
        t.slug.toLowerCase().includes(q) ||
        (parentCluster && parentCluster.name.toLowerCase().includes(q))
      );
    });
  }, [topics, topicSearch, clusters]);

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim() || !newTopicSlug.trim()) return;

    setCreatingTopic(true);
    try {
      const created = await createTopic({
        clusterId: Number(newTopicClusterId),
        name: newTopicName.trim(),
        slug: newTopicSlug.trim().toLowerCase(),
        isActive: true,
      });

      setTopics((prev) => [...prev, created]);
      onToggleTopic(created.id);

      setNewTopicName('');
      setNewTopicSlug('');
      setShowAddModal(false);
      setCreatingTopic(false);
    } catch (err: any) {
      setCreatingTopic(false);
      alert(err.message || 'Failed to create topic');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <label className="text-xs font-extrabold text-textPrimary">
            Select Linked Topics
          </label>
          <span className="px-2 py-0.5 rounded-md bg-brand/10 text-brand text-[10px] font-black">
            {selectedTopicIds.length} selected
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(!showAddModal)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:underline cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add New Topic</span>
        </button>
      </div>

      {/* Topic Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-textMuted" />
        <input
          type="text"
          placeholder="Search topics by name, slug, or cluster..."
          value={topicSearch}
          onChange={(e) => setTopicSearch(e.target.value)}
          className="w-full rounded-xl bg-bgSoft/70 pl-9 pr-8 py-2 text-xs font-bold text-textPrimary border border-borderLight outline-none focus:border-brand focus:bg-white transition-all"
        />
        {topicSearch && (
          <button
            type="button"
            onClick={() => setTopicSearch('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-textMuted hover:text-textPrimary p-0.5 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Inline Add Topic Form */}
      {showAddModal && (
        <div className="p-4 rounded-2xl bg-brand/5 border border-brand/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-brand">Create & Link New Topic</span>
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="text-textMuted hover:text-textPrimary cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold text-textMuted block mb-1">Topic Name *</label>
              <input
                type="text"
                placeholder="e.g. Cloud Infrastructure & DevOps"
                value={newTopicName}
                onChange={(e) => {
                  setNewTopicName(e.target.value);
                  setNewTopicSlug(
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
              <label className="text-[10px] font-bold text-textMuted block mb-1">Topic Slug *</label>
              <input
                type="text"
                placeholder="cloud-infrastructure-devops"
                value={newTopicSlug}
                onChange={(e) => setNewTopicSlug(e.target.value)}
                className="w-full rounded-xl bg-white px-3 py-2 text-xs font-bold text-textPrimary border border-borderLight"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-bold text-textMuted">Cluster</label>
                <button
                  type="button"
                  onClick={onOpenAddClusterModal}
                  className="text-[10px] font-bold text-success hover:underline cursor-pointer"
                >
                  + New Cluster
                </button>
              </div>
              <CustomDropdown
                value={newTopicClusterId}
                onChange={(val) => setNewTopicClusterId(Number(val))}
                options={clusters.map((c) => ({
                  value: c.id,
                  label: c.name,
                }))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-3 py-1.5 rounded-lg bg-white text-textPrimary text-xs font-bold border border-borderLight cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateTopic}
              disabled={creatingTopic || !newTopicName.trim()}
              className="px-4 py-1.5 rounded-lg bg-brand text-white text-xs font-black hover:bg-brand/90 disabled:opacity-50 cursor-pointer"
            >
              {creatingTopic ? 'Creating...' : 'Save & Select Topic'}
            </button>
          </div>
        </div>
      )}

      {/* Topic Buttons with Parent Cluster Badge */}
      <div className="flex flex-wrap gap-2.5 max-h-48 overflow-y-auto p-4 rounded-2xl bg-bgSoft border border-borderLight/60">
        {filteredTopics.length === 0 ? (
          <div className="w-full text-center py-4 text-xs font-bold text-textMuted">
            No topics matching &ldquo;{topicSearch}&rdquo;.{' '}
            <button
              type="button"
              onClick={() => {
                setNewTopicName(topicSearch);
                setNewTopicSlug(
                  topicSearch
                    .toLowerCase()
                    .trim()
                    .replace(/[^a-z0-9\s-]/g, '')
                    .replace(/\s+/g, '-')
                );
                setShowAddModal(true);
              }}
              className="text-brand hover:underline font-black ml-1 cursor-pointer"
            >
              + Create &ldquo;{topicSearch}&rdquo; now
            </button>
          </div>
        ) : (
          filteredTopics.map((t) => {
            const isSelected = selectedTopicIds.includes(t.id);
            const parentCluster = clusters.find((c) => c.id === t.clusterId);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onToggleTopic(t.id)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'bg-brand text-white shadow-xs'
                    : 'bg-white text-textPrimary hover:bg-borderLight border border-borderLight/60'
                }`}
                title={parentCluster ? `Cluster: ${parentCluster.name}` : undefined}
              >
                <span>{t.name}</span>
                {parentCluster && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-bgSoft text-textMuted'
                    }`}
                  >
                    {parentCluster.name}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
