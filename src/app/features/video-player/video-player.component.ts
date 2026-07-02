import { Component, inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { FileService } from '../../core/services/file.service';

@Component({
  selector: 'app-video-player',
  standalone: true,
  template: `
    <div class="player-wrap">
      <div class="bar">
        <button (click)="back()">← Indietro</button>
        <span class="name">{{ name }}</span>
        <button class="vol-btn" (click)="toggleMute()" [title]="muted ? 'Attiva audio' : 'Silenzia'">
          {{ muted ? '🔇' : volume > 0.5 ? '🔊' : '🔉' }}
        </button>
        <input
          class="vol-slider"
          type="range" min="0" max="1" step="0.05"
          [value]="volume"
          (input)="onVolumeChange($event)"
          title="Volume"
        />
      </div>
      <video
        #videoEl
        class="video"
        [src]="videoUrl"
        controls
        autoplay
        playsinline
      ></video>
    </div>
  `,
  styles: [`
    .player-wrap {
      display: flex; flex-direction: column; height: 100vh; background: #000;
    }
    .bar {
      display: flex; align-items: center; gap: 10px;
      padding: 8px 16px; background: #111; flex-shrink: 0;
    }
    button {
      background: none; border: none; color: #fff; cursor: pointer;
      font-size: 14px; padding: 4px 8px; border-radius: 6px;
      &:hover { background: rgba(255,255,255,0.1); }
    }
    .vol-btn { font-size: 18px; padding: 2px 6px; }
    .name {
      flex: 1; color: rgba(255,255,255,0.7); font-size: 13px;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .vol-slider {
      width: 90px; accent-color: #ff6b00; cursor: pointer;
    }
    .video { flex: 1; width: 100%; background: #000; }
  `],
})
export class VideoPlayerComponent implements OnInit {
  private route    = inject(ActivatedRoute);
  private location = inject(Location);
  private fileSvc  = inject(FileService);

  @ViewChild('videoEl') videoEl!: ElementRef<HTMLVideoElement>;

  videoUrl = '';
  name     = '';
  volume   = 1;
  muted    = false;

  ngOnInit(): void {
    const path = this.route.snapshot.queryParamMap.get('path') ?? '';
    this.name  = this.route.snapshot.queryParamMap.get('name') ?? '';
    this.videoUrl = this.fileSvc.previewUrl(path);
  }

  onVolumeChange(event: Event): void {
    const val = parseFloat((event.target as HTMLInputElement).value);
    this.volume = val;
    this.muted  = val === 0;
    if (this.videoEl) {
      this.videoEl.nativeElement.volume = val;
      this.videoEl.nativeElement.muted  = this.muted;
    }
  }

  toggleMute(): void {
    this.muted = !this.muted;
    if (this.videoEl) {
      this.videoEl.nativeElement.muted = this.muted;
    }
  }

  back(): void { this.location.back(); }
}
