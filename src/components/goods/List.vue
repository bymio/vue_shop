<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getGoodsList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getGoodsList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddpage">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- tab表格区域 -->
      <el-table :data="goodsList" border stripe>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column
          label="商品价格(元)"
          prop="goods_price"
          width="95px"
        ></el-table-column>
        <el-table-column
          label="商品重量"
          prop="goods_weight"
          width="70px"
        ></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="140px">
          <template v-slot="scope">
            {{ scope.row.add_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template v-slot="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="editById(scope.row)"
            ></el-button>
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="removeById(scope.row.goods_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="400"
        background
      >
      </el-pagination>
    </el-card>

    <!-- 编辑的对话框 -->
    <!-- 编辑的对话框 -->
    <el-dialog title="编辑" :visible.sync="editDialogVisible" width="50%">
      <!-- 编辑分类的表单 -->
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item label="商品名称" prop="goods_name">
          <el-input v-model="editForm.goods_name"></el-input>
        </el-form-item>
        <el-form-item label="商品价格" prop="goods_price">
          <el-input v-model="editForm.goods_price"></el-input>
        </el-form-item>
        <el-form-item label="商品重量" prop="goods_weight">
          <el-input v-model="editForm.goods_weight"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button @click="editGoods" type="primary">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10,
      },
      // 商品列表
      goodsList: [],
      // 总条数
      total: '',

      //控制编辑对话框的显示
      editDialogVisible: false,

      // 存储分类名称
      editForm: {},
      //添加分类 表单验证
      editFormRules: {
        goods_name: [
          { required: true, message: '请输入商品的名称', trigger: 'blur' },
        ],
        goods_price: [
          { required: true, message: '请输入商品的价格', trigger: 'blur' },
        ],
        goods_number: [
          { required: true, message: '请输入商品的数量', trigger: 'blur' },
        ],
        goods_weight: [
          { required: true, message: '请输入商品的重量', trigger: 'blur' },
        ],
      },
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    //根据分页获取对应的商品列表
    async getGoodsList() {
      const { data: res } = await this.$http.get('goods', {
        params: this.queryInfo,
      })
      if (res.meta.status !== 200) {
        this.$message.error('获取商品列表失败')
      }
      this.$message.success('获取商品列表成功')
      console.log(res.data)
      this.goodsList = res.data.goods
      this.total = res.data.total
    },

    //显示数据条数发生改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    // 页码发生改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },

    //显示编辑框
    async editById(goodsInfo) {
      const { data: res } = await this.$http.get('goods/' + goodsInfo.goods_id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询商品信息失败')
      }
      this.editForm = res.data

      this.editDialogVisible = true
    },
    // 编辑成功
    editGoods() {

      this.$refs.editFormRef.validate(async (valid) => {
        // 表单验证未通过
        if (!valid) {
          return
        }
        console.log(this.editForm)
        const { data: res } = await this.$http.put(
          'goods/' + this.editForm.goods_id,
          this.editForm
        )
        // 修改失败
        if (res.meta.status !== 200) {
          return this.$message.error('失败')
        }

        this.$message.success('成功')
        this.getGoodsList()
        this.editDialogVisible = false
      })
    },

    // 根据id删除商品数据
    async removeById(id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该商品, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      if (confirmResult !== 'confirm') {
        return this.$message.error('用户取消操作')
      }
      const { data: res } = await this.$http.delete(`goods/${id}`)
      if (res.meta.status !== 200) {
        this.$message.error('删除失败')
      }
      this.$message.success('删除成功')
      this.getGoodsList()
    },

    //跳转添加商品页面
    goAddpage() {
      this.$router.push('/goods/add')
    },
  },
}
</script>

<style lang='less' scoped>
</style>
