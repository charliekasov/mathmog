"use client";

import { Brain, Gauge, Wand2 } from 'lucide-react';
import { cn } from '../../core/cn';
import { getTopicInfo, getTopicsForLevel, topicHasDifficulty } from '../../core/drill-topics';
import type { Difficulty } from '../../core/types';
import { useProblem } from '../contexts/problem';
import { useSpeedChallenge } from '../contexts/speed-challenge';
import { useMathmogUI } from '../ui/provider';

const levels = [
  { level: 1, name: 'Memorize', Icon: Brain },
  { level: 2, name: 'Estimate', Icon: Gauge },
  { level: 3, name: 'Get Crafty', Icon: Wand2 },
];

const difficulties: Difficulty[] = ['Easy', 'Medium', 'Hard'];

export function TrainerConfigSelector() {
  const ui = useMathmogUI();
  const {
    currentLevel,
    currentDifficulty,
    currentTopic,
    currentScope,
    handleLevelDifficultyChange,
  } = useProblem();
  const { speedChallenge } = useSpeedChallenge();

  const availableTopics = getTopicsForLevel(currentLevel);
  const showDifficulty = !currentTopic || topicHasDifficulty(currentTopic);
  const topicValue = currentTopic ?? 'all';

  // Phase 1.4: Scope dropdown — fifth selector, conditional on the current
  // topic having a `scopes` set. Hidden in v1 for all topics whose registry
  // entry omits the field (Estimate, Get Crafty, plus the four Memorize
  // topics without scopes — advanced_squares, advanced_cubes, higher_powers,
  // common_multiples). Reads `currentScope` from `ProblemContext`; changes
  // route through `handleLevelDifficultyChange` to preserve the existing
  // reset semantics (history clears, score zeroes, fresh problem fetched).
  const topicInfo = currentTopic ? getTopicInfo(currentTopic) : undefined;
  const topicScopes = topicInfo?.scopes ?? [];
  const showScope = topicScopes.length > 0;

  // Grid column count: 2 (level + topic) plus optional scope + difficulty.
  // Cap at 4 columns on `sm:` so the 5th dropdown (problem count, owned by
  // the orchestrator's ready screen) can stack underneath without overflow.
  const visibleCount = 2 + (showScope ? 1 : 0) + (showDifficulty ? 1 : 0);
  const gridColsClass =
    visibleCount === 4
      ? 'sm:grid-cols-4'
      : visibleCount === 3
      ? 'sm:grid-cols-3'
      : 'sm:grid-cols-2';

  return (
    <div className="mb-6 space-y-4">
      <div className={cn('grid grid-cols-1 gap-4', gridColsClass)}>
        <div>
          <ui.Label htmlFor="level-select" className="mb-2 block">
            Skill
          </ui.Label>
          <ui.Select
            value={String(currentLevel)}
            onValueChange={(value) =>
              handleLevelDifficultyChange(parseInt(value), currentDifficulty, undefined)
            }
            disabled={speedChallenge.isActive}
          >
            <ui.SelectTrigger id="level-select" data-tour="mathmog-mode-select">
              <ui.SelectValue />
            </ui.SelectTrigger>
            <ui.SelectContent>
              {levels.map(({ level, name, Icon }) => (
                <ui.SelectItem key={level} value={String(level)}>
                  <span className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    {name}
                  </span>
                </ui.SelectItem>
              ))}
            </ui.SelectContent>
          </ui.Select>
        </div>
        <div>
          <ui.Label htmlFor="topic-select" className="mb-2 block">
            Topic
          </ui.Label>
          <ui.Select
            value={topicValue}
            onValueChange={(value) =>
              handleLevelDifficultyChange(
                currentLevel,
                currentDifficulty,
                value === 'all' ? undefined : value
              )
            }
            disabled={speedChallenge.isActive}
          >
            <ui.SelectTrigger id="topic-select" data-tour="mathmog-topic-select">
              <ui.SelectValue />
            </ui.SelectTrigger>
            <ui.SelectContent>
              <ui.SelectItem value="all">All topics</ui.SelectItem>
              {availableTopics.map((topic) => (
                <ui.SelectItem key={topic.id} value={topic.id}>
                  {topic.label}
                </ui.SelectItem>
              ))}
            </ui.SelectContent>
          </ui.Select>
        </div>
        {showScope && (
          <div>
            <ui.Label htmlFor="scope-select" className="mb-2 block">
              Scope
            </ui.Label>
            <ui.Select
              value={currentScope ?? topicScopes[0]?.id ?? ''}
              onValueChange={(value) =>
                handleLevelDifficultyChange(
                  currentLevel,
                  currentDifficulty,
                  currentTopic,
                  value
                )
              }
              disabled={speedChallenge.isActive}
            >
              <ui.SelectTrigger id="scope-select" data-tour="mathmog-scope-select">
                <ui.SelectValue />
              </ui.SelectTrigger>
              <ui.SelectContent>
                {topicScopes.map((scope) => (
                  <ui.SelectItem key={scope.id} value={scope.id}>
                    {scope.label}
                  </ui.SelectItem>
                ))}
              </ui.SelectContent>
            </ui.Select>
          </div>
        )}
        {showDifficulty && (
          <div>
            <ui.Label htmlFor="difficulty-select" className="mb-2 block">
              Difficulty
            </ui.Label>
            <ui.Select
              value={currentDifficulty}
              onValueChange={(value) =>
                handleLevelDifficultyChange(currentLevel, value as Difficulty, currentTopic, currentScope)
              }
              disabled={speedChallenge.isActive}
            >
              <ui.SelectTrigger id="difficulty-select" data-tour="mathmog-difficulty-select">
                <ui.SelectValue />
              </ui.SelectTrigger>
              <ui.SelectContent>
                {difficulties.map((difficulty) => (
                  <ui.SelectItem key={difficulty} value={difficulty}>
                    {difficulty}
                  </ui.SelectItem>
                ))}
              </ui.SelectContent>
            </ui.Select>
          </div>
        )}
      </div>
    </div>
  );
}
