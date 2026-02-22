/**
 * Shared utilities for BTS Universe scraping pipeline
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// ==================== SUPABASE ====================

export function createSupabaseAdmin() {
    const url = process.env.VITE_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
        console.error('❌ Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
        process.exit(1);
    }
    return createClient(url, key);
}

// ==================== RATE LIMITING ====================

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ==================== CACHE ====================

const CACHE_DIR = path.resolve(process.cwd(), 'scripts/cache');

export function loadCache<T>(filename: string): T | null {
    const filePath = path.join(CACHE_DIR, `${filename}.json`);
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

export function saveCache(filename: string, data: unknown): void {
    if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
    const filePath = path.join(CACHE_DIR, `${filename}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`   💾 Cached to ${path.relative(process.cwd(), filePath)}`);
}

// ==================== LOGGING ====================

export function logStart(task: string) { console.log(`\n🚀 ${task}\n${'━'.repeat(50)}`); }
export function logProgress(cur: number, total: number, item: string) { console.log(`   📊 [${cur}/${total}] ${item}`); }
export function logSuccess(msg: string) { console.log(`   ✅ ${msg}`); }
export function logError(msg: string) { console.error(`   ❌ ${msg}`); }
export function logWarning(msg: string) { console.log(`   ⚠️  ${msg}`); }
export function logDone(msg: string) { console.log(`\n${'━'.repeat(50)}\n✨ ${msg} 💜\n`); }

// ==================== MEMBER NAME MAP ====================

export const MEMBER_NAME_MAP: Record<string, string> = {
    // RM
    'RM': 'rm', 'Rap Monster': 'rm', 'Kim Namjoon': 'rm', 'Kim Nam-joon': 'rm',
    'Namjoon': 'rm', 'rapmonster': 'rm',
    // JIN
    'Jin': 'jin', 'JIN': 'jin', 'Kim Seokjin': 'jin', 'Kim Seok-jin': 'jin',
    'Seokjin': 'jin',
    // SUGA
    'SUGA': 'suga', 'Suga': 'suga', 'Agust D': 'suga', 'Min Yoongi': 'suga',
    'Min Yoon-gi': 'suga', 'Yoongi': 'suga',
    // J-HOPE
    'j-hope': 'jh', 'J-Hope': 'jh', 'J-HOPE': 'jh', 'Jung Hoseok': 'jh',
    'Jung Ho-seok': 'jh', 'Hoseok': 'jh', 'jhope': 'jh',
    // JIMIN
    'Jimin': 'jm', 'JIMIN': 'jm', 'Park Jimin': 'jm', 'Park Ji-min': 'jm',
    // V
    'V': 'v', 'Kim Taehyung': 'v', 'Kim Tae-hyung': 'v', 'Taehyung': 'v',
    // JUNGKOOK
    'Jungkook': 'jk', 'JK': 'jk', 'Jeon Jungkook': 'jk', 'Jeon Jung-kook': 'jk',
    'Jung Kook': 'jk',
};

export function extractMemberIds(names: string[]): string[] {
    const ids = new Set<string>();
    for (const name of names) {
        const id = MEMBER_NAME_MAP[name.trim()];
        if (id) ids.add(id);
    }
    return [...ids];
}

// ==================== TITLE NORMALIZATION ====================

export function normalizeTitle(title: string): string {
    return title
        .toLowerCase()
        .replace(/\s*\(feat\..*?\)/gi, '')
        .replace(/\s*\(ft\..*?\)/gi, '')
        .replace(/\s*\(prod\..*?\)/gi, '')
        .replace(/[^a-z0-9가-힣]/g, '')
        .trim();
}

/** Known alternate titles for matching across sources */
export const TITLE_ALIASES: Record<string, string[]> = {
    'Silver Spoon': ['Baepsae', 'Crow-Tit', 'Try-Hard', '뱁새'],
    'Dope': ['Jjeoleo', '쩔어'],
    'Fire': ['Bultaoreune', '불타오르네'],
    'Boy In Luv': ['Sangnamja', '상남자'],
    'Just One Day': ['Haru Man', '하루만'],
    'War of Hormone': ['Horeumon Jeonjaeng', '호르몬 전쟁'],
    'Spine Breaker': ['Deunggorbreaker', '등골브레이커'],
    'Am I Wrong': ['Am I Wrong'],
    'Go Go': ['고민보다 Go'],
    'Pied Piper': ['Pied Piper'],
    'MIC Drop': ['MIC Drop', 'Mic Drop'],
};

export function titlesMatch(a: string, b: string): boolean {
    if (normalizeTitle(a) === normalizeTitle(b)) return true;

    // Check aliases
    for (const [canonical, aliases] of Object.entries(TITLE_ALIASES)) {
        const allForms = [canonical, ...aliases].map(normalizeTitle);
        const normA = normalizeTitle(a);
        const normB = normalizeTitle(b);
        if (allForms.includes(normA) && allForms.includes(normB)) return true;
    }

    return false;
}
