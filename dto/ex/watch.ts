type SyncLog = {
    time: Date;
    url: string;
    position: number;
}

type M3U8Mapping = {
    url: string;
    m3u8Url: string;
    title: string;
    episode: number;
}

export type {SyncLog, M3U8Mapping};