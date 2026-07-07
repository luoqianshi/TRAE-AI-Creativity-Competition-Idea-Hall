import{d as f,o as d,c as o,a as e,b as s,e as i,w as n,E as S,f as b,t as l,u as m,F as g,r as _,g as R,h as k,i as y,j as P,_ as V}from"./index-Ht_o06TF.js";import{n as c}from"./nav-q_ZgqgCT.js";const B={class:"home"},w={class:"hero"},C={class:"container hero-inner"},x={class:"hero-text"},J={class:"cta-row"},M={class:"container docs-overview"},L={class:"doc-grid"},N={key:0,class:"more"},z=f({__name:"HomeView",setup(D){const h=R(()=>c.reduce((u,a)=>u+a.items.length,0));return(u,a)=>{const v=S,r=k("RouterLink");return d(),o("div",B,[e("section",w,[e("div",C,[e("div",x,[a[2]||(a[2]=e("div",{class:"badge"},"面向企业实战的 Java 后端学习路线",-1)),a[3]||(a[3]=e("h1",null,[s(" 从零到中级 "),e("br"),s(" Java 后端开发 "),e("span",{class:"hl"},"实战")],-1)),a[4]||(a[4]=e("p",{class:"lede"},[s(" 抛弃学校里的老旧内容，全部围绕 "),e("strong",null,"企业内 Java 后端开发"),s(" 的真实问题。 以"),e("strong",null,"多租户商城系统"),s("为主线业务，配合 MySQL、Redis、Spring Boot 等热门框架， 带你真正跑通一个能写进简历的工程。 ")],-1)),e("div",J,[i(r,{to:"/docs/java/01-intro"},{default:n(()=>[i(v,{type:"primary",size:"large"},{default:n(()=>[...a[0]||(a[0]=[s("从 Java 入门开始",-1)])]),_:1})]),_:1}),i(r,{to:"/roadmap"},{default:n(()=>[i(v,{size:"large"},{default:n(()=>[...a[1]||(a[1]=[s("查看学习路线",-1)])]),_:1})]),_:1})]),a[5]||(a[5]=e("div",{class:"meta-row"},[e("span",null,"✅ 4 个由浅入深的 Demo 工程"),e("span",null,"✅ 30+ 篇实战文档"),e("span",null,"✅ IDEA 社区版可直接学习")],-1))]),a[6]||(a[6]=e("div",{class:"hero-code"},[e("pre",null,[e("code",null,`// 你将学到的第一段企业代码
@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public Result<Page<Product>> page(
        @RequestParam(defaultValue = "1") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        return Result.ok(productService.page(page, size));
    }
}`)])],-1))])]),a[8]||(a[8]=b('<section class="container stages" data-v-e0c010d3><h2 data-v-e0c010d3>📚 四个阶段，由浅入深</h2><div class="stage-grid" data-v-e0c010d3><div class="stage-card" data-v-e0c010d3><div class="stage-num" data-v-e0c010d3>1</div><h3 data-v-e0c010d3>入门</h3><p data-v-e0c010d3>Java 基础语法、Maven 工程结构、单元测试</p><span class="stage-demo" data-v-e0c010d3>demo-01-java-basics</span></div><div class="stage-card" data-v-e0c010d3><div class="stage-num" data-v-e0c010d3>2</div><h3 data-v-e0c010d3>Web 入门</h3><p data-v-e0c010d3>Spring Boot、MyBatis-Plus、MySQL 增删改查</p><span class="stage-demo" data-v-e0c010d3>demo-02-springboot-crud</span></div><div class="stage-card" data-v-e0c010d3><div class="stage-num" data-v-e0c010d3>3</div><h3 data-v-e0c010d3>企业实践</h3><p data-v-e0c010d3>Redis 缓存、JWT 鉴权、统一响应与异常</p><span class="stage-demo" data-v-e0c010d3>demo-03-springboot-redis-auth</span></div><div class="stage-card" data-v-e0c010d3><div class="stage-num" data-v-e0c010d3>4</div><h3 data-v-e0c010d3>综合实战</h3><p data-v-e0c010d3>多租户商城系统：订单/库存/支付/限流</p><span class="stage-demo" data-v-e0c010d3>demo-04-multitenant-mall</span></div></div></section>',1)),e("section",M,[a[7]||(a[7]=e("h2",null,"📖 文档导航",-1)),e("p",null,"共 "+l(m(c).length)+" 个分类，"+l(h.value)+" 篇实战文档。",1),e("div",L,[(d(!0),o(g,null,_(m(c),t=>(d(),y(r,{key:t.title,to:t.base+"/"+t.items[0].path,class:"doc-card"},{default:n(()=>[e("h3",null,l(t.title),1),e("ul",null,[(d(!0),o(g,null,_(t.items.slice(0,3),p=>(d(),o("li",{key:p.path},l(p.title),1))),128)),t.items.length>3?(d(),o("li",N,"等 "+l(t.items.length)+" 篇...",1)):P("",!0)])]),_:2},1032,["to"]))),128))])])])}}}),q=V(z,[["__scopeId","data-v-e0c010d3"]]);export{q as default};
//# sourceMappingURL=HomeView-CLeRmMGj.js.map
