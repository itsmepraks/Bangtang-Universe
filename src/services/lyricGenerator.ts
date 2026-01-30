/**
 * Lyric Generator Service
 * 
 * Template-based and Markov chain lyric generation using BTS themes
 * and vocabulary. Runs entirely client-side with no API needed.
 */

// BTS-themed vocabulary banks
const VOCAB = {
    // Opening lines
    openings: [
        'Under the night sky, I see',
        'In this moment, we are',
        'Through the darkness, I found',
        'Even when it hurts, we',
        'Like the stars above, we',
        'In my galaxy, you are',
        'When I close my eyes, I',
        'Beyond the horizon lies',
        'Through every storm, we',
        'In this universe of ours,'
    ],

    // Main themes
    themes: [
        'the light that guides me home',
        'the wings that set me free',
        'a love that never fades',
        'the strength to carry on',
        'dreams that touch the sky',
        'a bond that time can\'t break',
        'healing through the pain',
        'hope in darkest nights',
        'youth that never ends',
        'fire burning in our souls'
    ],

    // Chorus hooks
    hooks: [
        'Together we rise, together we shine',
        'You\'re my universe, my everything',
        'Through the night, we\'ll find our way',
        'Purple hearts forever beating',
        'In this magic shop, we heal',
        'Running towards our destiny',
        'Bulletproof, we stand as one',
        'From small things, love grows',
        'Forever young, forever us',
        'We are eternal, we are infinite'
    ],

    // Bridge lines
    bridges: [
        'Even if tomorrow is dark and cold',
        'When the world seems to fall apart',
        'In the moments of doubt and fear',
        'Through the tears and silent screams',
        'As the seasons change around us'
    ],

    // Resolution lines
    resolutions: [
        'We\'ll never walk alone',
        'The best is yet to come',
        'Love yourself, speak yourself',
        'This is just the beginning',
        'Our story continues',
        'We are connected by purple',
        'Thank you for being you',
        'I purple you, always'
    ],

    // Emotional words
    emotions: [
        'love', 'hope', 'dream', 'shine', 'light', 'heart', 'soul', 'fire',
        'tears', 'pain', 'heal', 'fly', 'rise', 'grow', 'believe', 'trust'
    ],

    // BTS-specific references
    references: [
        'ARMY', 'Bangtan', 'Borahae', 'purple', 'Seoul', 'stadium',
        'microphone', 'stage', 'seven', 'forever', 'universe', 'spring day'
    ]
};

// Lyric structure templates
const TEMPLATES = [
    // Template 1: Ballad style
    {
        name: 'Ballad',
        structure: ['opening', 'theme', 'hook', 'bridge', 'hook', 'resolution']
    },
    // Template 2: Hip-hop style
    {
        name: 'Hip-Hop',
        structure: ['hook', 'opening', 'theme', 'theme', 'hook', 'resolution']
    },
    // Template 3: Pop style
    {
        name: 'Pop',
        structure: ['theme', 'theme', 'hook', 'hook', 'bridge', 'resolution']
    }
];

/**
 * Get random item from array
 */
const randomPick = <T>(arr: T[]): T => {
    return arr[Math.floor(Math.random() * arr.length)];
};

/**
 * Generate lyrics using templates
 */
export const generateTemplatelyrics = (style?: 'Ballad' | 'Hip-Hop' | 'Pop'): string => {
    const template = style
        ? TEMPLATES.find(t => t.name === style) || randomPick(TEMPLATES)
        : randomPick(TEMPLATES);

    const lines: string[] = [];
    const used = new Set<string>();

    template.structure.forEach(part => {
        let line: string;
        let attempts = 0;

        do {
            switch (part) {
                case 'opening':
                    line = randomPick(VOCAB.openings);
                    break;
                case 'theme':
                    line = randomPick(VOCAB.themes);
                    break;
                case 'hook':
                    line = randomPick(VOCAB.hooks);
                    break;
                case 'bridge':
                    line = randomPick(VOCAB.bridges);
                    break;
                case 'resolution':
                    line = randomPick(VOCAB.resolutions);
                    break;
                default:
                    line = randomPick(VOCAB.themes);
            }
            attempts++;
        } while (used.has(line) && attempts < 10);

        used.add(line);
        lines.push(line);
    });

    return lines.join('\n');
};

// Simple Markov chain for more natural generation
class MarkovChain {
    private chain: Map<string, string[]> = new Map();

    train(text: string) {
        const words = text.toLowerCase().split(/\s+/);
        for (let i = 0; i < words.length - 1; i++) {
            const current = words[i];
            const next = words[i + 1];

            if (!this.chain.has(current)) {
                this.chain.set(current, []);
            }
            this.chain.get(current)!.push(next);
        }
    }

    generate(startWord: string, length: number): string {
        const words: string[] = [startWord];
        let current = startWord.toLowerCase();

        for (let i = 0; i < length - 1; i++) {
            const possibilities = this.chain.get(current);
            if (!possibilities || possibilities.length === 0) {
                current = randomPick(Array.from(this.chain.keys()));
            } else {
                current = randomPick(possibilities);
            }
            words.push(current);
        }

        // Capitalize first letter of each sentence
        return words.join(' ')
            .replace(/(^\w|[.!?]\s+\w)/g, letter => letter.toUpperCase());
    }
}

// Pre-trained corpus from BTS themes
const TRAINING_CORPUS = `
Love yourself speak yourself dream hope shine light
In the darkness we find stars that never fade
Running through the night towards our destiny
Purple hearts connected across the universe
Seven souls one dream bulletproof forever
Through the pain we grow through tears we heal
The world is our stage and we are forever young
From small things great love blossoms
In this magic shop we trade fear for hope
Spring day comes after the coldest winter
Even when I fall you lift me up again
Together we are stronger than alone
The universe inside us mirrors stars above
Youth is not age but spirit and energy
Dreams without limits soar beyond the sky
In your eyes I see galaxies shining
Every step forward is progress never retreat
Love is the answer to every question
Home is where your heart rests peacefully
The journey matters more than destination
`;

// Initialize Markov chain
const markov = new MarkovChain();
markov.train(TRAINING_CORPUS);

/**
 * Generate lyrics using Markov chain
 */
export const generateMarkovLyrics = (length = 30): string => {
    const starters = ['love', 'in', 'through', 'the', 'we', 'dream', 'purple', 'together', 'even'];
    const startWord = randomPick(starters);

    const raw = markov.generate(startWord, length);

    // Format into lines
    const words = raw.split(' ');
    const lines: string[] = [];

    for (let i = 0; i < words.length; i += 6) {
        lines.push(words.slice(i, i + 6).join(' '));
    }

    return lines.join('\n');
};

/**
 * Generate a complete verse with mixed approach
 */
export const generateVerse = (): string => {
    const style = randomPick(['template', 'markov', 'hybrid']);

    if (style === 'template') {
        return generateTemplatelyrics();
    } else if (style === 'markov') {
        return generateMarkovLyrics();
    } else {
        // Hybrid: template opening + markov middle + template closing
        const opening = randomPick(VOCAB.openings);
        const middle = generateMarkovLyrics(18);
        const closing = randomPick(VOCAB.resolutions);

        return `${opening}\n\n${middle}\n\n${closing}`;
    }
};

/**
 * Generate lyrics with typewriter effect (returns generator)
 */
export function* typewriterGenerate(lyrics: string): Generator<string, void, unknown> {
    let current = '';
    for (const char of lyrics) {
        current += char;
        yield current;
    }
}

/**
 * Generate song title suggestion
 */
export const generateTitle = (): string => {
    const adjectives = ['Eternal', 'Purple', 'Golden', 'Silent', 'Burning', 'Endless', 'Rising'];
    const nouns = ['Dreams', 'Stars', 'Hearts', 'Wings', 'Universe', 'Light', 'Hope', 'Soul'];

    return `${randomPick(adjectives)} ${randomPick(nouns)}`;
};

export default {
    generateTemplatelyrics,
    generateMarkovLyrics,
    generateVerse,
    generateTitle,
    typewriterGenerate
};
