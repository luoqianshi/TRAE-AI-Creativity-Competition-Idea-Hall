# OCR API 配置说明

本项目使用阿里云通用文字识别（OCR）服务。

## 获取 API 密钥

1. 登录阿里云控制台：https://oss.console.aliyun.com/
2. 进入"产品与服务" → "人工智能" → "通用文字识别"
3. 开通服务并创建 AccessKey
4. 记录以下信息：
   - **AccessKey ID**：类似 `LTAI5t...`
   - **AccessKey Secret**：类似 `xxxx...`

## 配置步骤

1. 打开 `ocr.js` 文件
2. 找到第 4-5 行：
   ```javascript
   this.apiEndpoint = 'https://ocr-api.cn-hangzhou.aliyuncs.com';
   this.accessKeyId = 'YOUR_ACCESS_KEY_ID';
   this.accessKeySecret = 'YOUR_ACCESS_KEY_SECRET';
   ```
3. 替换为你的实际密钥：
   ```javascript
   this.accessKeyId = 'LTAI5tXXXXXXXXXXXXXXXXX';
   this.accessKeySecret = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
   ```

## API 说明

- **服务地址**：`https://ocr-api.cn-hangzhou.aliyuncs.com`
- **识别语言**：默认 `CHN_ENG`（中英文混合）
- **请求格式**：JSON
- **认证方式**：APPCODE（AccessKey ID）

## 注意事项

1. **安全性**：不要将密钥提交到代码仓库或公开分享
2. **配额限制**：阿里云 OCR 服务有免费额度，超出后需要付费
3. **网络要求**：需要能够访问阿里云 API（可能需要配置代理）
4. **图片格式**：支持 JPG、PNG 等常见图片格式

## 测试

配置完成后，刷新页面并尝试识别图片，查看控制台是否有错误信息。

## 故障排查

如果识别失败，请检查：
1. AccessKey ID 和 Secret 是否正确
2. 网络连接是否正常
3. 是否有足够的 API 配额
4. 浏览器控制台是否有错误信息