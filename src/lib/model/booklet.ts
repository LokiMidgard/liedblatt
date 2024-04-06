import type { Wrap } from "abcjs";




export type BookElement =
    ScoreElement | SpaceElement | TextElement | PageBreakElement | ImageElement;

export type Book = {
    elements: BookElement[]
    style: {}
};


export type SpaceElement = {
    type: 'space'
    distance: number,
};
export type TextElement = {
    type: 'text'
    text: string,
    scale: number,
    alignment: 'left' | 'right' | 'center' | 'justify'
};
export type PageBreakElement = {
    type: 'break'
};

export type ImageElement = {
    type: 'image'
    url: string
    width: number,
    rounding: number,
    float: boolean,
    alignment: 'left' | 'right' | 'center',
};

export type ScoreReference = {
    source: 'Gotteslob (2003)' | 'Unterwegs';
    no: number;
};

export type ScoreData = {
    lyrics: string[],
    title: string,
    reference: ScoreReference | null
    author: {
        text: string,
        music: string,
    } | undefined,
    abc: string,
    scale: number,
    linesettings: Wrap
    timing: [number, number],
    baseNote: [number, number],
    speed: [number, number, number],
    key: 'C'
}
export type ScoreElement = {
    type: 'score'
    lyricsDisplay: ('score' | 'below' | undefined)[],
    showTitle: boolean,
    showSpeed: boolean,
    showAuthor: boolean,
} & ScoreData

class LineWriter {
    private _text: string;
    constructor() {
        this._text = '';
    }

    public appendLine(line: string) {
        this._text = this._text + '\n' + line;
    }

    public get text(): string {
        return this._text;
    }

}
export function getAbcFormat(element: ScoreData, lyricstUnderNote: number[], lyricstUnderScore: number[], showTitle = true, showSpeed = true, showAuthor = true): [string, string[]] {
    const writer = new LineWriter();
    writer.appendLine('X:1');
    if (showTitle)
        writer.appendLine(`T:${element.title}`);
    if (showAuthor && element.author) {
        if (element.author.music == element.author.text && element.author.text) {
            writer.appendLine(`C:T u. M: ${element.author.music}`);
        } else {
            if (element.author.text && element.author.music) {
                writer.appendLine(`C:T: ${element.author.text}, M: ${element.author.music}`);
            } else if (element.author.text) {
                writer.appendLine(`C:T: ${element.author.text}`);
            } else if (element.author.music) {
                writer.appendLine(`C:M: ${element.author.music}`);
            }
        }


    }
    writer.appendLine(`M:${element.timing[0]}/${element.timing[1]}`)
    writer.appendLine(`L:${element.baseNote[0]}/${element.baseNote[1]}`)
    if (showSpeed)
        writer.appendLine(`Q:${element.speed[0]}/${element.speed[1]}=${element.speed[2]}`)
    writer.appendLine(`K:${element.key}`)
    writer.appendLine(element.abc.replaceAll(/\n/g, ' ').trim());
    for (const l of lyricstUnderNote) {
        if ((l) < element.lyrics.length)
            writer.appendLine(`w:${l + 1}.~${element.lyrics[l].replaceAll(/\n/g, ' ')}`);
    }
    // for (const l of lyricstUnderScore) {
    //     if ((l) < element.lyrics.length)
    //         writer.appendLine(`W:${l + 1}. ${element.lyrics[l].trim()
    //             .replaceAll(/~/g, ' ')
    //             .replaceAll(/[-_]/g, '').replaceAll(/\n/g, ' ')}`);
    // }
    return [writer.text, lyricstUnderScore.map(l=>element.lyrics[l])] as const;
    //     return `
    // X:1
    // T: ${element.title}
    // G: 88
    // C: T u. M: unbekannt
    // M: 4/4
    // L: 1/4
    // Q: 1/4=120
    // K: C
    // "C""^①"cG"F"A"C"E|"Dm"FD"G"G"C"HE|"^②"(CD/2E/2F)G|(Ab/2c/2B)HC|]
    // w:1.~Seg-ne, Va-ter, die-se Ga-ben. 1\\-2~A----men, A----men.
    // w:2.~Dank dir, Va-ter, für die Ga-ben.
    // `;
}