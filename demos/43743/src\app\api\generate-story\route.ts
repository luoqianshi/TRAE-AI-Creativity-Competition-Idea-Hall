import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import { execute, query, queryOne } from '@/lib/db';
import { getCurrentProfile, generateId, ensureSettingsForChild } from '@/lib/auth';
import { AGE_PROMPTS, buildUserPrompt } from '@/lib/prompts';
import { getOpenAI, hasOpenAIKey } from '@/lib/openai';
import { estimateDurationSeconds } from '@/utils/format';
import type { AgeGroup } from '@/types/story';
import { OFFLINE_STORIES } from '@/lib/offline';

const Schema = z.object({
  childId: z.string().min(1),
  theme: z.string().optional(),
  customPrompt: z.string().max(200).optional(),
});

interface StoryOutput {
  title: string;
  fullText: string;
}

function fallbackStory(theme?: string, customPrompt?: string): StoryOutput {
  // 离线兜底：从内置故事里挑一个或拼一段
  const pool = OFFLINE_STORIES;
  const pick = pool[Math.floor(Math.random() * pool.length)];
  const titlePrefix = customPrompt ? `「${customPrompt.slice(0, 6)}」` : '';
  return {
    title: `${titlePrefix}${pick.title}`,
    fullText: pick.fullText,
  };
}

export async function POST(req: NextRequest) {
  try {
    const profile = getCurrentProfile();
    if (!profile) {
      return NextResponse.json(
        { ok: false, error: { code: 'UNAUTHORIZED', message: '请先登录' } },
        { status: 401 }
      );
    }
    const body = await req.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_INPUT', message: '参数错误' } },
        { status: 400 }
      );
    }
    const { childId, theme, customPrompt } = parsed.data;

    // 验证 child 属于当前 profile
    const child = queryOne<{ id: string; age_group: AgeGroup }>(
      'SELECT id, age_group FROM children WHERE id = :id AND profile_id = :pid',
      { id: childId, pid: profile.profileId }
    );
    if (!child) {
      return NextResponse.json(
        { ok: false, error: { code: 'CHILD_NOT_FOUND', message: '孩子档案不存在' } },
        { status: 404 }
      );
    }

    const systemPrompt = AGE_PROMPTS[child.age_group] || AGE_PROMPTS['3-4'];
    const userPrompt = buildUserPrompt(theme || '', customPrompt);

    let storyOutput: StoryOutput;
    const openai = getOpenAI();

    if (!openai) {
      storyOutput = fallbackStory(theme, customPrompt);
    } else {
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.85,
          max_tokens: 900,
        });
        const content = completion.choices[0]?.message?.content || '';
        try {
          storyOutput = JSON.parse(content);
          if (!storyOutput.title || !storyOutput.fullText) {
            throw new Error('incomplete output');
          }
        } catch {
          // 容错：直接当作正文，标题截取首句
          storyOutput = {
            title: (content.split('\n')[0] || '小故事').slice(0, 12),
            fullText: content,
          };
        }
      } catch (err) {
        console.warn('openai generate failed, fallback to offline', err);
        storyOutput = fallbackStory(theme, customPrompt);
      }
    }

    const id = uuid();
    const duration = estimateDurationSeconds(storyOutput.fullText);
    execute(
      `INSERT INTO stories (id, child_id, title, theme, full_text, audio_url, duration_seconds, is_seed)
       VALUES (:id, :cid, :title, :theme, :text, NULL, :dur, 0)`,
      {
        id,
        cid: childId,
        title: storyOutput.title,
        theme: theme || 'animal',
        text: storyOutput.fullText,
        dur: duration,
      }
    );

    return NextResponse.json({
      ok: true,
      data: {
        story: {
          id,
          title: storyOutput.title,
          fullText: storyOutput.fullText,
          theme: theme || 'animal',
          durationSeconds: duration,
        },
        openaiAvailable: hasOpenAIKey(),
      },
    });
  } catch (e) {
    console.error('generate-story error', e);
    return NextResponse.json(
      { ok: false, error: { code: 'SERVER_ERROR', message: '生成失败' } },
      { status: 500 }
    );
  }
}
