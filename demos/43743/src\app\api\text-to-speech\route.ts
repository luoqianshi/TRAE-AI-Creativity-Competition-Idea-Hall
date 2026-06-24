import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import path from 'node:path';
import fs from 'node:fs/promises';
import { getCurrentProfile } from '@/lib/auth';
import { execute, queryOne } from '@/lib/db';
import { getOpenAI } from '@/lib/openai';
import { preprocessForTTS } from '@/lib/text-preprocess';

const Schema = z.object({
  storyId: z.string().min(1),
  text: z.string().min(1).max(4000),
});

const AUDIO_DIR = path.join(process.cwd(), 'public', 'audio');

// 优化后的"温暖女声"配置：
// - voice: shimmer（OpenAI 最暖最柔的女声；nova 偏新闻播报）
// - model: tts-1-hd（比 tts-1 明显更自然，停顿更柔）
// - speed: 0.88（讲故事偏慢，亲切）
// - 文本在送入 TTS 前会经过 preprocessForTTS：转数字、加省略号、对话包裹、起手"嗯，"
const TTS_CONFIG = {
  voice: 'shimmer' as const,
  model: 'tts-1-hd' as const,
  speed: 0.88,
};

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
    const { storyId, text } = parsed.data;

    // 验证 story 属于当前 profile
    const story = queryOne<{ id: string; child_id: string }>(
      `SELECT s.id, s.child_id FROM stories s
       JOIN children c ON c.id = s.child_id
       WHERE s.id = :id AND c.profile_id = :pid`,
      { id: storyId, pid: profile.profileId }
    );
    if (!story) {
      return NextResponse.json(
        { ok: false, error: { code: 'STORY_NOT_FOUND', message: '故事不存在' } },
        { status: 404 }
      );
    }

    const filePath = path.join(AUDIO_DIR, `story_${storyId}.mp3`);
    const publicPath = `/audio/story_${storyId}.mp3`;

    // 已存在则直接返回（缓存命中）
    try {
      await fs.access(filePath);
      execute('UPDATE stories SET audio_url = :url WHERE id = :id', { url: publicPath, id: storyId });
      return NextResponse.json({ ok: true, data: { audioUrl: publicPath, cached: true, config: TTS_CONFIG } });
    } catch {
      // 文件不存在，继续生成
    }

    const openai = getOpenAI();
    if (!openai) {
      // 无 API key：不写入任何 audio_url，让客户端走浏览器 TTS 兜底
      console.warn(`[tts] no OPENAI_API_KEY, fallback to browser TTS for story ${storyId}`);
      return NextResponse.json({
        ok: true,
        data: { audioUrl: '', fallback: true, reason: 'no_api_key' },
      });
    }

    // 自然化文本
    const naturalText = preprocessForTTS(text);

    try {
      await fs.mkdir(AUDIO_DIR, { recursive: true });
      const speech = await openai.audio.speech.create({
        model: TTS_CONFIG.model,
        voice: TTS_CONFIG.voice,
        input: naturalText,
        speed: TTS_CONFIG.speed,
        response_format: 'mp3',
      });
      const buffer = Buffer.from(await speech.arrayBuffer());
      await fs.writeFile(filePath, buffer);
      execute('UPDATE stories SET audio_url = :url WHERE id = :id', { url: publicPath, id: storyId });
      return NextResponse.json({
        ok: true,
        data: { audioUrl: publicPath, cached: false, config: TTS_CONFIG, charsProcessed: naturalText.length },
      });
    } catch (err) {
      console.warn(`[tts] openai tts failed for story ${storyId}:`, err);
      // OpenAI 调用失败：也不写入假路径，让客户端走浏览器 TTS
      return NextResponse.json({
        ok: true,
        data: { audioUrl: '', fallback: true, reason: 'openai_error' },
      });
    }
  } catch (e) {
    console.error('tts error', e);
    return NextResponse.json(
      { ok: false, error: { code: 'SERVER_ERROR', message: '语音合成失败' } },
      { status: 500 }
    );
  }
}
