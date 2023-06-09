import { AudioClip, AudioSource, resources } from "cc";

export class AudioManager {

    private static _audioSource: AudioSource = null;
    private _isInit: boolean = false;

    public init(audioSource: AudioSource) {
        if (this._isInit) {
            return;
        }
        AudioManager._audioSource = audioSource;
        this._isInit = true;
    }

    public playMusic(): void {
        AudioManager._audioSource.play();
    }

    public stopMusic(): void {
        AudioManager._audioSource.stop();
    }

    public playSound(name: string): void {
        resources.load('audios/' + name, AudioClip, (err, res) => {
            if (err) {
                console.log(err);
            } else {
                AudioManager._audioSource.playOneShot(res);
            }
        });
    }

    public static get Instance() {
        return this._instance || (this._instance = new AudioManager());
    }

    private static _instance: AudioManager;
}

export let audioManager: AudioManager = AudioManager.Instance;