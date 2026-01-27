import type { MathmogDrillConfig } from '@/lib/types';
import { getTopicInfo } from '@/lib/drill-topics';

const levelNames: Record<number, string> = {
  1: 'Memorize',
  2: 'Estimate',
  3: 'Get Crafty',
};

export function getDrillDisplayName(config: MathmogDrillConfig): string {
  const topicInfo = config.topic ? getTopicInfo(config.topic) : undefined;
  const countLabel = config.isSpeedChallenge
    ? `Speed Challenge - ${config.duration ?? 2}min`
    : `${config.problemCount} problems`;

  if (topicInfo) {
    const parts = [`Mathmog: ${topicInfo.label}`];
    if (topicInfo.hasDifficulty) {
      parts.push(`- ${config.difficulty}`);
    }
    parts.push(`(${countLabel})`);
    return parts.join(' ');
  }

  return `Mathmog: ${levelNames[config.level] || `Level ${config.level}`} - ${config.difficulty} (${countLabel})`;
}

export function buildDrillUrl(config: MathmogDrillConfig, baseUrl: string): string {
  const params = new URLSearchParams({
    level: String(config.level),
    difficulty: config.difficulty,
  });
  if (config.topic) {
    params.set('topic', config.topic);
  }
  if (config.isSpeedChallenge) {
    params.set('mode', 'speed');
    params.set('duration', String(config.duration ?? 2));
  } else {
    params.set('count', String(config.problemCount));
  }
  return `${baseUrl}/student/practice?${params.toString()}`;
}
