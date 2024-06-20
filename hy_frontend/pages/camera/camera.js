// pages/camera/camera.js
const recorderManager = wx.getRecorderManager();
Page({
  data: {
    // 其他数据
  },

  onLoad: function () {
    this.cameraContext = wx.createCameraContext();
    this.edgeThreshold = 50; // 边缘检测阈值
  },

  onCameraInitDone: function () {
    this.startFrameListener();
  },

  startFrameListener: function () {
    const listener = this.cameraContext.onCameraFrame((frame) => {
      this.processFrame(frame);
    });
    listener.start();
  },

  processFrame: function (frame) {
    const { width, height, data } = frame;
    const ctx = wx.createCanvasContext('canvas');
    const imageData = new Uint8ClampedArray(data);
    const edges = this.detectEdges(imageData, width, height);

    ctx.putImageData(new ImageData(edges, width, height), 0, 0);
    ctx.draw();
  },

  detectEdges: function (imageData, width, height) {
    // 简单的边缘检测算法
    const edgeData = new Uint8ClampedArray(imageData.length);
    for (let i = 0; i < imageData.length; i += 4) {
      const r = imageData[i];
      const g = imageData[i + 1];
      const b = imageData[i + 2];
      const brightness = (r + g + b) / 3;
      const edgeValue = brightness < this.edgeThreshold ? 0 : 255;
      edgeData[i] = edgeData[i + 1] = edgeData[i + 2] = edgeValue;
      edgeData[i + 3] = 255; // Alpha channel
    }
    return edgeData;
  },

  takePhoto: function () {
    this.cameraContext.takePhoto({
      quality: 'high',
      success: (res) => {
        console.log(res.tempImagePath);
        // 这里可以进行进一步处理
      }
    });
  },

  startRecording: function () {
    this.cameraContext.startRecord({
      success: (res) => {
        console.log('开始录制视频');
      }
    });
  },

  stopRecording: function () {
    this.cameraContext.stopRecord({
      success: (res) => {
        console.log(res.tempVideoPath);
        // 处理录制的视频
      }
    });
  },

  onFrameData: function (e) {
    const frame = e.detail;
    this.processFrame(frame);
  },

  onCameraTap: function (e) {
    const x = e.detail.x;
    const y = e.detail.y;
    this.cameraContext.autoFocus({
      x,
      y,
      success: () => {
        console.log('自动对焦成功');
      }
    });
  }
});