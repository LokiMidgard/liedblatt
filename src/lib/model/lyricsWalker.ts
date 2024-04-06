
export function* walkLyrics(lyrics: string): Iterable<string> {
    let current = '';
    for (let i = 0; i < lyrics.length; i++) {
        const element = lyrics[i];
        if (element == ' ') {
            if (current != '') {
                yield current+' ';
            }
            current = '';
        } else if (element == '~') {
            if (current[current.length - 1] != ' ') {
                current += ' '
            }
        } else if (element == '-' || element == '_') {
            yield current;
            current = ''
        } else {
            current += element;
        }
    }
    if (current != '') {
        yield current;
    }
};

