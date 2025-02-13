import { useRef, useState, useCallback } from 'react';
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL, fetchFile } from "@ffmpeg/util";

const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';

export type UseFFmpegConverterReturnType = {
    load: () => Promise<void>;
    convertWebmToMp3: (webmBlob: Blob, filename: string) => Promise<Blob>;
    loaded: boolean;
};

const useFFmpegConverter = (): UseFFmpegConverterReturnType => {
    const ffmpegRef = useRef(new FFmpeg());    
    const [loaded, setLoaded] = useState<boolean>(false);
    
    const load = useCallback(async (): Promise<void> => {
       
        const ffmpeg = ffmpegRef.current;
        if (!ffmpeg) throw new Error("FFmpeg instance is not initialized.");        

        try {
            await ffmpeg.load({
                coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
            });

            setLoaded(true);
            
        } catch (error) {
            console.error("Error loading ffmpeg:", error);
            throw error;
        }
    }, []);
    
    const convertWebmToMp3 = useCallback(async (webmBlob: Blob, filename: string): Promise<Blob> => {

        if (!loaded) await load();

        const ffmpeg = ffmpegRef.current;

        if (!ffmpeg) throw new Error("FFmpeg instance is not available.");

        await ffmpeg.writeFile('input.webm', await fetchFile(webmBlob));
        await ffmpeg.exec(['-i', 'input.webm', 'output.mp3']);
        const data = await ffmpeg.readFile('output.mp3');
        const mp3Blob = new Blob([data], { type: 'audio/mp3' });

        return mp3Blob;        
       
    }, [loaded, load]);

    return { load, convertWebmToMp3, loaded };
};

export { useFFmpegConverter };
