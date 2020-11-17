// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * [[VideoFrameProcessorPipelineObserver]] is an interface that can be wired with [[VideoFrameProcessorPipeline]] to receive lifecycle or performance callbacks.
 */
export default interface VideoFrameProcessorPipelineObserver {
  /**
   * `processingDidStart` will be called when [[VideoFrameProcessorPipeline]] starts streaming.
   */
  processingDidStart?(): void;

  /**
   * `processingDidFailToStart` will be called when [[VideoFrameProcessorPipeline]] could not start streaming due to runtime error or time out.
   */
  processingDidFailToStart?(): void;

  /**
   * `processingDidStop` will be called when [[VideoFrameProcessorPipeline]] stops streaming expectedly.
   */
  processingDidStop?(): void;

  /**
   * `processingLatencyTooHigh` will be called when the execution of [[VideoFrameProcessor]] slows the frame rate down by half.
   */
  processingLatencyTooHigh?(latencyMs: number): void;
}
