import streamlit as st
from agno.agent import Agent
from agno.run.agent import RunOutput
from agno.tools.exa import ExaTools
from agno.tools.firecrawl import FirecrawlTools
from agno.models.openai import OpenAIChat
from agno.tools.duckduckgo import DuckDuckGoTools
import pandas as pd
import requests
from firecrawl import FirecrawlApp
from pydantic import BaseModel, Field
from typing import List, Optional
import json

# Streamlit UI
st.set_page_config(page_title="智能竞品分析系统", layout="wide")

# Sidebar for API keys
st.sidebar.title("API 密钥配置")
openai_api_key = st.sidebar.text_input("OpenAI API Key", type="password")
firecrawl_api_key = st.sidebar.text_input("Firecrawl API Key", type="password")

# Add search engine selection before API keys
search_engine = st.sidebar.selectbox(
    "选择搜索引擎",
    options=["Perplexity AI - Sonar Pro", "Exa AI"],
    help="选择用于查找竞品网址的AI服务"
)

# Show relevant API key input based on selection
if search_engine == "Perplexity AI - Sonar Pro":
    perplexity_api_key = st.sidebar.text_input("Perplexity API Key", type="password")
    # Store API keys in session state
    if openai_api_key and firecrawl_api_key and perplexity_api_key:
        st.session_state.openai_api_key = openai_api_key
        st.session_state.firecrawl_api_key = firecrawl_api_key
        st.session_state.perplexity_api_key = perplexity_api_key
    else:
        st.sidebar.warning("请输入所有必需的API密钥以继续。")
else:  # Exa AI
    exa_api_key = st.sidebar.text_input("Exa API Key", type="password")
    # Store API keys in session state
    if openai_api_key and firecrawl_api_key and exa_api_key:
        st.session_state.openai_api_key = openai_api_key
        st.session_state.firecrawl_api_key = firecrawl_api_key
        st.session_state.exa_api_key = exa_api_key
    else:
        st.sidebar.warning("请输入所有必需的API密钥以继续。")

# Main UI
st.title("🔍 智能竞品分析系统")
st.info(
    """
    本系统帮助企业通过提取竞品网站的结构化数据并利用AI生成洞察，从而分析竞争对手。
    - 提供您公司的 **网址** 或 **描述**。
    - 系统将获取竞品网址、提取相关信息并生成详细的分析报告。
    """
)
st.success("为获得更好结果，请同时提供网址和5-6个字的公司描述！")

# Input fields for URL and description
url = st.text_input("输入您的公司网址：")
description = st.text_area("输入公司描述（如果没有网址）：")

# Initialize API keys and tools
if "openai_api_key" in st.session_state and "firecrawl_api_key" in st.session_state:
    if (search_engine == "Perplexity AI - Sonar Pro" and "perplexity_api_key" in st.session_state) or \
       (search_engine == "Exa AI" and "exa_api_key" in st.session_state):
        
        firecrawl_tools = FirecrawlTools(
            api_key=st.session_state.firecrawl_api_key,
            scrape=False,
            crawl=True,
            limit=5
        )

        # Create ExaTools agent for finding competitor URLs
        if search_engine == "Exa AI":
            exa_tools = ExaTools(
                api_key=st.session_state.exa_api_key,
                category="company",
                num_results=3
            )
            competitor_finder_agent = Agent(
                model=OpenAIChat(id="gpt-4o", api_key=st.session_state.openai_api_key),
                tools=[exa_tools],
                debug_mode=True,
                markdown=True,
                instructions=[
                    "你是一个竞品发现智能体。使用ExaTools查找竞品公司网址。",
                    "当给定网址时，查找相似公司。当给定描述时，搜索匹配该描述的公司。",
                    "仅返回网址，每行一个，不要添加其他文本。"
                ]
            )

        firecrawl_agent = Agent(
            model=OpenAIChat(id="gpt-4o", api_key=st.session_state.openai_api_key),
            tools=[firecrawl_tools, DuckDuckGoTools()],
            debug_mode=True,
            markdown=True
        )

        analysis_agent = Agent(
            model=OpenAIChat(id="gpt-4o", api_key=st.session_state.openai_api_key),
            debug_mode=True,
            markdown=True
        )

        # New agent for comparing competitor data
        comparison_agent = Agent(
            model=OpenAIChat(id="gpt-4o", api_key=st.session_state.openai_api_key),
            debug_mode=True,
            markdown=True
        )

        def get_competitor_urls(url: str = None, description: str = None) -> list[str]:
            if not url and not description:
                raise ValueError("请提供网址或描述。")

            if search_engine == "Perplexity AI - Sonar Pro":
                perplexity_url = "https://api.perplexity.ai/chat/completions"
                
                content = "请为我找到3个与以下公司相似的竞品网址："
                if url and description:
                    content += f"网址：{url}，描述：{description}"
                elif url:
                    content += f"网址：{url}"
                else:
                    content += f"描述：{description}"
                content += "。仅返回网址，不要其他文本。"

                payload = {
                    "model": "sonar-pro",
                    "messages": [
                        {
                            "role": "system",
                            "content": "请精确返回3个公司网址，仅返回网址。"
                        },
                        {
                            "role": "user",
                            "content": content
                        }
                    ],
                    "max_tokens": 1000,
                    "temperature": 0.2,
                }
                
                headers = {
                    "Authorization": f"Bearer {st.session_state.perplexity_api_key}",
                    "Content-Type": "application/json"
                }

                try:
                    response = requests.post(perplexity_url, json=payload, headers=headers)
                    response.raise_for_status()
                    urls = response.json()['choices'][0]['message']['content'].strip().split('\n')
                    return [url.strip() for url in urls if url.strip()]
                except Exception as e:
                    st.error(f"从Perplexity获取竞品网址时出错：{str(e)}")
                    return []

            else:  # Exa AI
                try:
                    # Use ExaTools agent to find competitor URLs
                    if url:
                        prompt = f"查找3个与以下网址相似的竞品公司网址：{url}。仅返回网址，每行一个。"
                    else:
                        prompt = f"查找3个匹配以下描述的竞品公司网址：{description}。仅返回网址，每行一个。"
                    
                    response: RunOutput = competitor_finder_agent.run(prompt)
                    # Extract URLs from the response
                    urls = [line.strip() for line in response.content.strip().split('\n') if line.strip() and line.strip().startswith('http')]
                    return urls[:3]  # Return up to 3 URLs
                except Exception as e:
                    st.error(f"从Exa获取竞品网址时出错：{str(e)}")
                    return []

        class CompetitorDataSchema(BaseModel):
            company_name: str = Field(description="公司名称")
            pricing: str = Field(description="定价详情、层级和方案")
            key_features: List[str] = Field(description="产品/服务的主要功能和特性")
            tech_stack: List[str] = Field(description="使用的技术、框架和工具")
            marketing_focus: str = Field(description="主要营销角度和目标受众")
            customer_feedback: str = Field(description="客户评价、评论和反馈")

        def extract_competitor_info(competitor_url: str) -> Optional[dict]:
            try:
                # Initialize FirecrawlApp with API key
                app = FirecrawlApp(api_key=st.session_state.firecrawl_api_key)
                
                # Add wildcard to crawl subpages
                url_pattern = f"{competitor_url}/*"
                
                extraction_prompt = """
                提取有关该公司产品的详细信息，包括：
                - 公司名称和基本信息
                - 定价详情、方案和层级
                - 主要功能和核心能力
                - 技术栈和技术细节
                - 营销重点和目标受众
                - 客户反馈和评价
                
                分析整个网站内容，为每个字段提供全面的信息。
                """
                
                response = app.extract(
                    [url_pattern],
                    prompt=extraction_prompt,
                    schema=CompetitorDataSchema.model_json_schema()
                )
                
                # Handle ExtractResponse object
                try:
                    if hasattr(response, 'success') and response.success:
                        if hasattr(response, 'data') and response.data:
                            extracted_info = response.data
                            
                            # Create JSON structure
                            competitor_json = {
                                "competitor_url": competitor_url,
                                "company_name": extracted_info.get('company_name', 'N/A') if isinstance(extracted_info, dict) else getattr(extracted_info, 'company_name', 'N/A'),
                                "pricing": extracted_info.get('pricing', 'N/A') if isinstance(extracted_info, dict) else getattr(extracted_info, 'pricing', 'N/A'),
                                "key_features": extracted_info.get('key_features', [])[:5] if isinstance(extracted_info, dict) and extracted_info.get('key_features') else getattr(extracted_info, 'key_features', [])[:5] if hasattr(extracted_info, 'key_features') else ['N/A'],
                                "tech_stack": extracted_info.get('tech_stack', [])[:5] if isinstance(extracted_info, dict) and extracted_info.get('tech_stack') else getattr(extracted_info, 'tech_stack', [])[:5] if hasattr(extracted_info, 'tech_stack') else ['N/A'],
                                "marketing_focus": extracted_info.get('marketing_focus', 'N/A') if isinstance(extracted_info, dict) else getattr(extracted_info, 'marketing_focus', 'N/A'),
                                "customer_feedback": extracted_info.get('customer_feedback', 'N/A') if isinstance(extracted_info, dict) else getattr(extracted_info, 'customer_feedback', 'N/A')
                            }
                            
                            return competitor_json
                        else:
                            return None
                    else:
                        return None
                        
                except Exception as response_error:
                    return None
                    
            except Exception as e:
                return None

        def generate_comparison_report(competitor_data: list) -> None:
            # Create DataFrame directly from competitor data
            if not competitor_data:
                st.error("没有可用于对比的竞品数据")
                return
            
            # Prepare data for DataFrame
            table_data = []
            for competitor in competitor_data:
                row = {
                    '公司': f"{competitor.get('company_name', 'N/A')} ({competitor.get('competitor_url', 'N/A')})",
                    '定价': competitor.get('pricing', 'N/A')[:100] + '...' if len(competitor.get('pricing', '')) > 100 else competitor.get('pricing', 'N/A'),
                    '核心功能': ', '.join(competitor.get('key_features', [])[:3]) if competitor.get('key_features') else 'N/A',
                    '技术栈': ', '.join(competitor.get('tech_stack', [])[:3]) if competitor.get('tech_stack') else 'N/A',
                    '营销重点': competitor.get('marketing_focus', 'N/A')[:100] + '...' if len(competitor.get('marketing_focus', '')) > 100 else competitor.get('marketing_focus', 'N/A'),
                    '客户反馈': competitor.get('customer_feedback', 'N/A')[:100] + '...' if len(competitor.get('customer_feedback', '')) > 100 else competitor.get('customer_feedback', 'N/A')
                }
                table_data.append(row)
            
            # Create DataFrame
            df = pd.DataFrame(table_data)
            
            # Display the table
            st.subheader("竞品对比")
            st.dataframe(df, use_container_width=True)
            
            # Also show raw data for debugging
            with st.expander("查看原始竞品数据"):
                st.json(competitor_data)

        def generate_analysis_report(competitor_data: list):
            # Format the competitor data for the prompt
            formatted_data = json.dumps(competitor_data, indent=2)
            print("分析数据：", formatted_data)  # For debugging
            
            report: RunOutput = analysis_agent.run(
                f"""分析以下JSON格式的竞品数据，识别市场机会以改进我们自己的公司：
                
                {formatted_data}

                任务：
                1. 根据竞品产品识别市场空白和机会
                2. 分析竞品的弱点，我们可以利用这些弱点
                3. 推荐我们应该开发的独特功能或能力
                4. 建议定价和定位策略以获得竞争优势
                5. 概述未充分开发的市场细分中的具体增长机会
                6. 为产品开发和上市策略提供可执行的建议

                专注于寻找我们可以差异化并做得比竞品更好的机会。
                突出任何我们可以解决的未满足客户需求或痛点。
                """
            )
            return report.content

        # Run analysis when the user clicks the button
        if st.button("分析竞品"):
            if url or description:
                with st.spinner("正在获取竞品网址..."):
                    competitor_urls = get_competitor_urls(url=url, description=description)
                    st.write(f"找到 {len(competitor_urls)} 个竞品网址")
                
                if not competitor_urls:
                    st.error("未找到竞品网址！")
                    st.stop()
                
                competitor_data = []
                successful_extractions = 0
                failed_extractions = 0
                
                for i, comp_url in enumerate(competitor_urls):
                    with st.spinner(f"正在分析竞品 {i+1}/{len(competitor_urls)}: {comp_url}"):
                        competitor_info = extract_competitor_info(comp_url)
                        
                        if competitor_info is not None:
                            competitor_data.append(competitor_info)
                            successful_extractions += 1
                            st.success(f"✓ 成功分析 {comp_url}")
                        else:
                            failed_extractions += 1
                            st.error(f"✗ 无法分析 {comp_url}")
                
                if competitor_data:
                    st.success(f"成功分析 {successful_extractions}/{len(competitor_urls)} 个竞品！")
                    
                    # Generate and display comparison report
                    with st.spinner("正在生成对比表格..."):
                        generate_comparison_report(competitor_data)
                    
                    # Generate and display final analysis report
                    with st.spinner("正在生成分析报告..."):
                        analysis_report = generate_analysis_report(competitor_data)
                        st.subheader("竞品分析报告")
                        st.markdown(analysis_report)
                    
                    st.success("分析完成！")
                else:
                    st.error("无法从任何竞品网址提取数据")
                    st.write("这可能是由于：")
                    st.write("- API速率限制（请几分钟后重试）")
                    st.write("- 网站访问问题（某些网站阻止自动访问）")
                    st.write("- 网址无效（请尝试不同的公司描述）")
            else:
                st.error("请提供网址或描述。")
