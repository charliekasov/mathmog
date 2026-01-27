"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Copy, Check, ExternalLink, Eye } from 'lucide-react';
import type { Difficulty, MathmogDrillConfig } from '@/lib/types';
import { getTopicsForLevel, topicHasDifficulty, type DrillTopicInfo } from '@/lib/drill-topics';
import { getDrillDisplayName, buildDrillUrl } from '@/lib/mathmog-assignments';

const levels = [
  { level: 1, name: 'Memorize' },
  { level: 2, name: 'Estimate' },
  { level: 3, name: 'Get Crafty' },
];

const difficulties: Difficulty[] = ['Easy', 'Medium', 'Hard'];

interface DrillEntry {
  id: number;
  config: MathmogDrillConfig;
  url: string;
}

export default function AssignHomeworkClient() {
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('Easy');
  const [problemCount, setProblemCount] = useState(20);
  const [isSpeedChallenge, setIsSpeedChallenge] = useState(false);
  const [duration, setDuration] = useState(2);
  const [drills, setDrills] = useState<DrillEntry[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [nextId, setNextId] = useState(1);

  const availableTopics = getTopicsForLevel(selectedLevel);
  const showDifficulty = selectedTopic === null || topicHasDifficulty(selectedTopic);

  const handleLevelChange = (levelStr: string) => {
    const level = parseInt(levelStr, 10);
    setSelectedLevel(level);
    setSelectedTopic(null);
  };

  const handleTopicChange = (value: string) => {
    setSelectedTopic(value === 'all' ? null : value);
  };

  const buildCurrentConfig = (): MathmogDrillConfig => ({
    level: selectedLevel,
    difficulty: selectedDifficulty,
    problemCount,
    topic: selectedTopic || undefined,
    isSpeedChallenge: isSpeedChallenge || undefined,
    duration: isSpeedChallenge ? duration : undefined,
  });

  const handleAddDrill = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const config = buildCurrentConfig();
    const url = buildDrillUrl(config, baseUrl);
    setDrills(prev => [...prev, { id: nextId, config, url }]);
    setNextId(prev => prev + 1);
  };

  const handlePreviewConfig = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const config = buildCurrentConfig();
    const url = buildDrillUrl(config, baseUrl);
    window.open(url, '_blank');
  };

  const handleRemoveDrill = (id: number) => {
    setDrills(prev => prev.filter(d => d.id !== id));
  };

  const handleCopyUrl = async (drill: DrillEntry) => {
    try {
      await navigator.clipboard.writeText(drill.url);
      setCopiedId(drill.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback: select text
    }
  };

  const handleCopyAll = async () => {
    const allUrls = drills.map(d => `${getDrillDisplayName(d.config)}\n${d.url}`).join('\n\n');
    try {
      await navigator.clipboard.writeText(allUrls);
      setCopiedId(-1);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-6">
      <h1 className="text-2xl font-bold">Assign Mathmog Drills</h1>

      <Card>
        <CardHeader>
          <CardTitle>Configure Drill</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="level-select" className="mb-2 block">Level</Label>
              <Select value={String(selectedLevel)} onValueChange={handleLevelChange}>
                <SelectTrigger id="level-select"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {levels.map(({ level, name }) => (
                    <SelectItem key={level} value={String(level)}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="topic-select" className="mb-2 block">Topic</Label>
              <Select value={selectedTopic || 'all'} onValueChange={handleTopicChange}>
                <SelectTrigger id="topic-select"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Topics (Mixed)</SelectItem>
                  {availableTopics.map((topic: DrillTopicInfo) => (
                    <SelectItem key={topic.id} value={topic.id}>{topic.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {showDifficulty && (
              <div>
                <Label htmlFor="difficulty-select" className="mb-2 block">Difficulty</Label>
                <Select value={selectedDifficulty} onValueChange={(v) => setSelectedDifficulty(v as Difficulty)}>
                  <SelectTrigger id="difficulty-select"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {difficulties.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <Switch
              id="speed-challenge-toggle"
              checked={isSpeedChallenge}
              onCheckedChange={(checked) => setIsSpeedChallenge(!!checked)}
            />
            <Label htmlFor="speed-challenge-toggle" className="text-sm font-medium cursor-pointer">
              Speed Challenge
            </Label>
          </div>

          {isSpeedChallenge ? (
            <div>
              <Label className="mb-2 block">Duration</Label>
              <div className="flex gap-2">
                {[1, 2, 3].map((d) => (
                  <Button
                    key={d}
                    type="button"
                    variant={duration === d ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDuration(d)}
                  >
                    {d} min
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <Label htmlFor="count-input" className="mb-2 block">Problems</Label>
              <Input
                id="count-input"
                type="number"
                min={5}
                max={50}
                value={problemCount}
                onChange={(e) => setProblemCount(Math.max(5, Math.min(50, parseInt(e.target.value) || 20)))}
              />
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleAddDrill} className="flex-1">
              <Plus className="w-4 h-4 mr-2" /> Add Drill
            </Button>
            <Button onClick={handlePreviewConfig} variant="outline">
              <Eye className="w-4 h-4 mr-2" /> Preview
            </Button>
          </div>
        </CardContent>
      </Card>

      {drills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Assigned Drills ({drills.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {drills.map((drill) => (
              <div key={drill.id} className="flex items-center justify-between gap-2 p-3 bg-secondary/50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{getDrillDisplayName(drill.config)}</p>
                  <p className="text-xs text-muted-foreground truncate">{drill.url}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.open(drill.url, '_blank')}
                    className="h-8 w-8"
                    title="Preview drill"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopyUrl(drill)}
                    className="h-8 w-8"
                  >
                    {copiedId === drill.id ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveDrill(drill.id)}
                    className="h-8 w-8 text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

            <Button onClick={handleCopyAll} variant="outline" className="w-full mt-2">
              {copiedId === -1 ? <Check className="w-4 h-4 mr-2 text-green-600" /> : <Copy className="w-4 h-4 mr-2" />}
              Copy All Links
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
