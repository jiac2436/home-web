# HomeWeb 后端服务 (Python / FastAPI)

基于 **FastAPI** 与 **Uvicorn** 构建的高性能、轻量级异步后端服务，为 HomeWeb 前端提供动态数据与接口支撑。

---

## 特性

- **现代化异步框架**：基于 FastAPI，原生支持 Python 类型注解与 Pydantic v2 校验。
- **开箱即用 API 文档**：本地运行后访问 `/docs` (Swagger UI) 或 `/redoc` (ReDoc) 即可实时调试。
- **CORS 跨域预置**：默认已打通 Vite 本地开发前端（端口 `5173`）与本地服务（端口 `8000`）。
- **统一响应格式**：内置 `ApiResponse` 规范（`code`, `message`, `data`）。

---

## 目录结构

```text
server/
├── app/
│   ├── api/                 # 路由定义层
│   │   ├── v1/
│   │   │   ├── health.py    # 健康探针接口 (/api/v1/health)
│   │   │   └── papers.py    # 论文与展示模块接口 (/api/v1/papers)
│   │   └── router.py        # 路由汇聚
│   ├── core/
│   │   └── config.py        # 环境与全局配置（CORS, PORT等）
│   ├── schemas/             # Pydantic 数据规范定义
│   │   ├── common.py        # 统一返回结构
│   │   └── papers.py        # 论文展示模块 Schema
│   └── main.py              # FastAPI 应用工厂与入口
├── requirements.txt         # 核心依赖列表
├── run.py                   # 启动便捷脚本
├── .env.example             # 环境变量模版
└── README.md
```

---

## 快速上手

### 1. 创建并激活虚拟环境

在 `server/` 目录下：

```bash
cd server
python3 -m venv .venv
source .venv/bin/activate
```

*(若本机已安装 `uv`，亦可使用 `uv venv .venv && source .venv/bin/activate` 获得极速体验)*

### 2. 安装依赖

```bash
pip install -r requirements.txt
# 或者使用 uv:
# uv pip install -r requirements.txt
```

### 3. 配置环境变量（可选）

如需自定义端口或跨域白名单，可复制并编辑配置：

```bash
cp .env.example .env
```

### 4. 启动服务

```bash
python run.py
```

或者使用 uvicorn 命令直接启动：

```bash
uvicorn app.main:app --reload --port 8000
```

---

## 接口调试与查看

服务启动后，在浏览器中打开：
- **Swagger 交互式文档**：[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc 文档**：[http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
- **健康检查探针**：[http://127.0.0.1:8000/api/v1/health](http://127.0.0.1:8000/api/v1/health)
- **论文数据接口**：[http://127.0.0.1:8000/api/v1/papers](http://127.0.0.1:8000/api/v1/papers)
