// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import VideoFrameProcessor from './VideoFrameProcessor';
import VideoFrameProcessorPipelineObserver from './VideoFrameProcessorPipelineObserver';

/**
 * [[VideoFrameProcessorPipeline]] controls the video processing in high level.
 * It explicitly to invoke the execution of {@link VideoFrameProcessor} in interval specified by `framerate`.
 */
export default interface VideoFrameProcessorPipeline {
  /**
   * Sets the input for the pipeline. It will start the processing steps.
   * Once pipeline starts, it can only be stopped by setting the input to `null`.
   */
  setInputMediaStream(mediaStream: MediaStream): Promise<void>;

  /**
   * Returns the current input `MediaStream`.
   */
  getInputMediaStream(): Promise<MediaStream>;

  /**
   * Returns the output `MediaStream` after processors are applied.
   */
  getOutputMediaStream(): Promise<MediaStream>;

  /**
   * Add [[VideoFrameProcessorPipelineObserver]] observer to receive lifecycle and performance callback.
   */
  addObserver(observer: VideoFrameProcessorPipelineObserver): void;

  /**
   * Remove [[VideoFrameProcessorPipelineObserver]] observer.
   */
  removeObserver(observer: VideoFrameProcessorPipelineObserver): void;

  /**
   * List of processors to execute to produce output media stream.
   */
  processors: VideoFrameProcessor[];

  /**
   * The desired output frame rate.
   */
  framerate: number;

  /**
   * Produced output `MediaStream` as a result of processor executions.
   */
  readonly outputMediaStream: MediaStream;
}
