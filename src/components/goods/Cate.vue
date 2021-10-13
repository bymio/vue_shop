<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button @click="showAddCateDialog" type="primary"
            >添加分类</el-button
          >
        </el-col>
      </el-row>

      <!-- 为表格进行占位 -->
      <tree-table
        :data="this.cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        class="tree-table"
      >
        <!-- 是否有效列 -->
        <template v-slot:isok="scope">
          <i
            v-if="scope.row.cat_deleted === false"
            style="color: lightgreen"
            class="el-icon-success"
          ></i>
          <i v-else style="color: red" class="el-icon-error"></i>
        </template>

        <!-- 排序列 -->
        <template v-slot:order="scope">
          <el-tag v-if="scope.row.cat_level === 0" size="mini">一级</el-tag>
          <el-tag
            v-else-if="scope.row.cat_level === 1"
            size="mini"
            type="success"
            >二级</el-tag
          >
          <el-tag v-else size="mini" type="warning">三级</el-tag>
        </template>

        <!-- 操作列 -->
        <template v-slot:opt="scope">
          <el-button
            size="mini"
            type="primary"
            icon="el-icon-edit"
            @click="showEditCateDialog(scope.row.cat_id)"
            >编辑</el-button
          >
          <el-button
            size="mini"
            type="danger"
            icon="el-icon-delete"
            @click="removeCateById(scope.row.cat_id)"
            >删除</el-button
          >
        </template>
      </tree-table>
      <!-- 为分页区域进行占位 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="this.queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="this.total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加分类的对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <!-- 添加分类的表单 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>

        <el-form-item label="父级分类">
          <!-- options用来指定数据源 -->
          <el-cascader
            v-model="selectedKeys"
            :options="this.parentCateList"
            :props="cascaderProps"
            @change="parentCateChanged"
            clearable
            change-on-select
          ></el-cascader>
        </el-form-item>
      </el-form>

      <span slot="footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate()">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑的对话框 -->
    <el-dialog title="编辑" :visible.sync="editCateDialogVisible" width="50%">
      <!-- 编辑分类的表单 -->
      <el-form
        :model="editCateForm"
        :rules="editCateFormRules"
        ref="editCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button @click="editCate()" type="primary">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      // 总数据条数
      total: 0,
      //商品分类的数据列表
      cateList: [],

      //为table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name',
        },
        {
          label: '是否有效',
          //表示将当前列定义为模板列
          type: 'template',
          //表示将这一行列使用模板名称
          template: 'isok',
        },
        {
          label: '排序',
          //表示将当前列定义为模板列
          type: 'template',
          //表示将这一行列使用模板名称
          template: 'order',
        },
        {
          label: '操作',
          //表示将当前列定义为模板列
          type: 'template',
          //表示将这一行列使用模板名称
          template: 'opt',
        },
      ],

      //添加分类对话框显示
      addCateDialogVisible: false,

      //添加分类的表单数据对象
      addCateForm: {
        //将要添加的分类名称
        cat_name: '',
        //父级分类的id
        cat_pid: 0,
        //分类的等级默认是一级分类
        cat_level: 0,
      },

      //添加分类 表单验证
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类的名称', trigger: 'blur' },
        ],
      },

      // 父级分类的列表
      parentCateList: [],

      //指定级联选择器的配置对象
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
      },

      //选中的父级分类的id数组
      selectedKeys: [],

      //控制编辑对话框的显示
      editCateDialogVisible: false,

      // 存储分类名称
      editCateForm: {},
      //添加分类 表单验证
      editCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类的名称', trigger: 'blur' },
        ],
      },
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取商品列表
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo,
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      //把数据列表赋值给cateList
      this.cateList = res.data.result
      // 为总数据条数赋值
      this.total = res.data.total
      console.log(this.cateList)
    },

    //监听pagesize改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },

    //监听pagenum的改变的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },

    //点击按钮展示添加分类的对话框
    showAddCateDialog() {
      //先获取父级分类的数据列表在展开对话框
      this.getParentCateList()
      this.addCateDialogVisible = true
    },

    //获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: {
          type: 2,
        },
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败')
      }
      this.parentCateList = res.data
    },

    //选择项发生变化触发这个函数
    parentCateChanged() {
      //如果selectedKeys中的数组大于0 则选中了父级分类
      console.log(this.selectedKeys)

      if (this.selectedKeys.length > 0) {
        // 父级分类的id
        this.addCateForm.cat_pid =
          this.selectedKeys[this.selectedKeys.length - 1]
        //当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
        return
      } else {
        // 重置父级Id
        this.addCateForm.cat_pid = 0
        // 重置当前分类的等级
        this.addCateForm.cat_level = 0
      }
    },

    //点击按钮添加新的分类
    addCate() {
      this.$refs.addCateFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateForm
        )
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败')
        }
        this.$message.success('添加成功')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },

    //监听对话框的关闭事件重置表单数据
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      // 重置父级Id
      this.addCateForm.cat_pid = 0
      // 重置当前分类的等级
      this.addCateForm.cat_level = 0
    },

    //编辑对话框的显示
    async showEditCateDialog(id) {
      const { data: res } = await this.$http.get('categories/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户信息失败')
      }
      this.editCateForm = res.data

      this.editCateDialogVisible = true
    },

    // 点击按钮编辑成功
    editCate() {
      this.$refs.editCateFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          'categories/' + this.editCateForm.cat_id,
          {
            cat_name: this.editCateForm.cat_name,
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('编辑分类信息失败')
        }
        this.getCateList()
        this.editCateDialogVisible = false
        this.$message.success('编辑分类信息信息成功')
      })
    },

    //根据id删除分类
    async removeCateById(id){
      const confirmResult = await this.$confirm(
        '此操作将永久删除该分类, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      // 如果用户确认删除，则返回为字符串 confirm 取消删除则返回值为字符串 cancel
      // console.log(confirmResult)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已经取消删除')
      }
      console.log('确认了删除')
      const { data: res } = await this.$http.delete('categories/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户失败！')
      }
      this.$message.success('删除用户成功!')
      this.getCateList()
    }
  },
}
</script>

<style lang='less' scoped>
.tree-table {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>
