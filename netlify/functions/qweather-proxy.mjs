import axios from 'axios';
import { SignJWT, importPKCS8 } from 'jose';
import fs from 'fs';
import path from 'path';

// JWT 配置
const PROJECT_ID = process.env.QWEATHER_PROJECT_ID;
const CREDENTIAL_ID = process.env.QWEATHER_CREDENTIAL_ID; // kid（凭据ID）

// 读取私钥
let privateKeyPem;
try {
  const keyPath = path.join(process.cwd(), 'ed25519-private.pem');
  privateKeyPem = fs.readFileSync(keyPath, 'utf8');
} catch (error) {
  console.error('无法读取私钥文件:', error);
}

/**
 * 生成 JWT Token（使用 jose 库支持 EdDSA）
 */
async function generateToken() {
  if (!privateKeyPem) {
    throw new Error('私钥未配置');
  }
  
  if (!CREDENTIAL_ID) {
    throw new Error('凭据ID未配置，请设置 QWEATHER_CREDENTIAL_ID');
  }
  
  // 导入 Ed25519 私钥
  const privateKey = await importPKCS8(privateKeyPem, 'EdDSA');
  
  // 生成 JWT（严格按照和风天气文档）
  const now = Math.floor(Date.now() / 1000);
  const token = await new SignJWT({
    sub: PROJECT_ID,      // 项目ID
    iat: now - 30,        // 签发时间（提前30秒防止时间误差）
    exp: now + 7200       // 过期时间（2小时）
  })
    .setProtectedHeader({ 
      alg: 'EdDSA',       // 算法
      kid: CREDENTIAL_ID  // 凭据ID（必需）
    })
    .sign(privateKey);
  
  return token;
}

/**
 * Netlify Function 处理器
 */
export const handler = async (event, context) => {
  // 处理 CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // 处理 OPTIONS 请求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const { endpoint, location } = event.queryStringParameters || {};
    
    if (!endpoint || !location) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: '缺少必要参数' })
      };
    }

    // 生成 JWT Token
    const token = await generateToken();
    
    // 调用和风天气 API（使用 JWT Bearer Token 认证）
    const apiHost = process.env.QWEATHER_API_HOST || 'https://devapi.qweather.com';
    const response = await axios.get(`${apiHost}${endpoint}`, {
      params: {
        location,
        lang: 'zh'
      },
      headers: {
        'Authorization': `Bearer ${token}`  // JWT Bearer Token 认证
      }
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    console.error('API 调用失败:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: '获取天气数据失败',
        message: error.message 
      })
    };
  }
};
