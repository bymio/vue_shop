<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false"> </el-alert>

      <!-- 步骤条区域 -->
      <el-steps :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- tab栏区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
        <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="beforeTabLeave" @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0" aria-readonly>
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input type="number" v-model="addForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input type="number" v-model="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader v-model="addForm.goods_cat" :options="cateList" :props="cateProps" @change="handleChange"></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <!-- 渲染表单的item项 -->
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox v-for="(cb, i) in item.attr_vals" :key="i" :label="cb" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action表示图片需要上传的ip地址 -->
            <el-upload :action="uploadURL" :on-preview="handlePreview" :on-remove="handleRemove" list-type="picture" :headers="headerObj" :on-success="handleSuccess">
              <el-button size="medium" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编译器组件 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <!-- 添加商品的按钮 -->
            <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" class="previewImg" />
    </el-dialog>
  </div>
</template>

<script>
import _ from 'loadsh'
export default {
  data() {
    return {
      activeIndex: '0',

      //添加商品的表单数据对象
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0,
        //商品所属的分类数组
        goods_cat: [],
        //图片的数组
        pics: [],
        //商品的详情
        goods_introduce: '',
        attrs: [],
      },
      addFormRules: {
        goods_name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
        goods_price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }],
        goods_weight: [{ required: true, message: '请输入商品重量', trigger: 'blur' }],
        goods_number: [{ required: true, message: '请输入商品数量', trigger: 'blur' }],
        goods_cat: [{ required: true, message: '请选择商品分类', trigger: 'blur' }],
      },

      //商品分类列表
      cateList: [],

      // 可选项数据源
      cateProps: {
        expandTrigger: 'hover',
        label: 'cat_name',
        value: 'cat_id',
        children: 'children',
      },

      //动态参数列表数据
      manyTableData: [],
      //静态属性
      onlyTableData: [],

      //上传图片的URL地址
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',

      //图片上传组件的请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem('token'),
      },

      //预览图片存储处
      previewPath: '',

      //预览显示与否
      previewVisible: false,
    }
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    },
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取所有商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类列表失败')
      }
      this.cateList = res.data
    },

    //级联选择器选中项变化 会触发的函数
    handleChange() {
      console.log(this.addForm.goods_cat)
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },

    //选中标签页打印当前的和跳转的
    beforeTabLeave(activeName, oldActiveName) {
      console.log(activeName, oldActiveName)
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择分类')
        return false
      }
    },

    //标签点击切换
    async tabClicked() {
      // console.log(this.activeIndex);
      //证明访问的是动态参数面板
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: {
            sel: 'many',
          },
        })
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数列表失败')
        }
        // 转换为数组
        res.data.forEach((item) => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyTableData = res.data
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: {
            sel: 'only',
          },
        })
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数列表失败')
        }
        // // 转换为数组
        // res.data.forEach((item) => {
        //   item.attr_vals =
        //     item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        // })
        this.onlyTableData = res.data
      } else if (this.activeIndex === '3') {
      }
    },

    //处理图片预览效果
    handlePreview(file) {
      this.previewPath = file.response.data.url
      this.previewVisible = true
    },

    //处理移除图片的操作
    handleRemove(file) {
      // 1. 获取将要删除的图片的临时路径
      const filePath = file.response.data.tmp_pathlog
      // 2. 从pics数组中找到这个图片
      const i = this.addForm.pics.findIndex((x) => {
        x.pic === filePath
      })
      // 3. 调用splice方法 移除
      this.addForm.pics.splice(i, 1)
      console.log(this.addForm)
    },

    // 监听图片上传成功的事件
    handleSuccess(response) {
      console.log(response)
      //1.拼接得到一个图片信息对象
      const picInfo = { pic: response.data.tmp_path }
      //2. 将图片对象加入到数组中
      this.addForm.pics.push(picInfo)
    },

    //添加商品
    add() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return
        // 深拷贝一个addForm
        //loadsh cloneDeep(obj)
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        //处理动态参数跟静态属性都加入到一个数组中
        this.manyTableData.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value_: item.attr_vals.join(' '),
          }
          this.addForm.attrs.push(newInfo)
        })
        this.onlyTableData.forEach((item) => {
          const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs

        //发起请求
        const { data: res } = await this.$http.post('goods', form)
        if (res.meta.status !== 201) {
          return this.$message.error('添加失败')
        }
        this.getCateList()
        this.$message.success('添加成功')
        this.$router.push('/goods')
      })
    },
  },
}
</script>

<style lang='less' scoped>
.el-steps {
  margin: 15px 0;
}
.el-checkbox {
  margin: 0 5px 0 0 !important;
}
.previewImg {
  width: 100%;
}
.btnAdd {
  margin-top: 15px;
}
</style>
