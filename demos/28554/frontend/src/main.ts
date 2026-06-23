import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import 'vant/lib/index.css'
import './assets/styles/index.css'

// 导入并注册所有Vant组件
import {
  Button,
  Field,
  Cell,
  CellGroup,
  Icon,
  Tabbar,
  TabbarItem,
  NavBar,
  Sticky,
  Grid,
  GridItem,
  Popup,
  ActionSheet,
  Form,
  DatePicker,
  Toast,
  Dialog,
  Tag,
  Card,
  List,
  PullRefresh,
  Empty
} from 'vant'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 注册Vant组件
app.use(Button)
app.use(Field)
app.use(Cell)
app.use(CellGroup)
app.use(Icon)
app.use(Tabbar)
app.use(TabbarItem)
app.use(NavBar)
app.use(Sticky)
app.use(Grid)
app.use(GridItem)
app.use(Popup)
app.use(ActionSheet)
app.use(Form)
app.use(DatePicker)
app.use(Toast)
app.use(Dialog)
app.use(Tag)
app.use(Card)
app.use(List)
app.use(PullRefresh)
app.use(Empty)

app.mount('#app')
