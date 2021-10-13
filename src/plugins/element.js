import Vue from 'vue'
import {
  Button,
  Form,
  FormItem,
  Input,
  Message,
  Container,
  Header,
  Aside,
  Main,
  Menu,
  MenuItem,
  Submenu,
  Breadcrumb,
  BreadcrumbItem,
  Card,
  Row,
  Col,
  Table,
  TableColumn,
  Switch,
  tooltip,
  Pagination,
  Dialog,
  MessageBox,
  Tag,
  Tree,
  Select,
  Option,
  Cascader,
  Alert,
  Tabs,
  TabPane,
  Steps,
  Step,
  Checkbox,
  CheckboxGroup,
  Upload,
  Timeline,
  TimelineItem,

} from 'element-ui'

Vue.use(Button).use(Form).use(FormItem).use(Container)
  .use(Header).use(Input).use(Aside).use(Main).use(Menu)
  .use(MenuItem).use(Submenu).use(Breadcrumb).use(BreadcrumbItem)
  .use(Card).use(Row).use(Col).use(Table).use(TableColumn)
  .use(Switch).use(tooltip).use(Pagination).use(Dialog)
  .use(Tag).use(Tree).use(Select).use(Option).use(Cascader)
  .use(Alert).use(Tabs).use(TabPane).use(Steps).use(Step)
  .use(Checkbox).use(CheckboxGroup).use(Upload).use(Timeline)
  .use(TimelineItem)

//提示信息
Vue.prototype.$message = Message
Vue.prototype.$confirm = MessageBox.confirm