// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import VideoFrameBuffer from './VideoFrameBuffer';

/**
 * [[VideoFrameProcessor]] is a unit of video processing for an array of {@link VideoFrameBuffer}.
 * It produces an array of {@link VideoFrameBuffer}. It can be chained together to be used with {@link VideoFrameProcessorPipeline}.
 */
export default interface VideoFrameProcessor {
  /**
   * Processes the array of {@link VideoFrameBuffer} and returns an array of {@link VideoFrameBuffer}.
   */
  process(buffers: VideoFrameBuffer[]): Promise<VideoFrameBuffer[]>;
}
