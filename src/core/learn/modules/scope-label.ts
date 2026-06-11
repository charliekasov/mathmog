// Shared by the per-topic module files: module labels are looked up from the
// drill-topic registry at build time so they can't drift from the scope
// labels students see on the Drill side.

import { DRILL_TOPIC_REGISTRY } from '../../drill-topics';

export const registryScopeLabel = (topicId: string, scopeId: string): string => {
  const topic = DRILL_TOPIC_REGISTRY.find(t => t.id === topicId);
  const scope = topic?.scopes?.find(s => s.id === scopeId);
  if (!scope) throw new Error(`Unknown ${topicId} scope: ${scopeId}`);
  return scope.label;
};
