<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="企业编号" prop="id">
        <el-input v-model="queryParams.id" placeholder="请输入企业编号" style="width: 150px" clearable
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="所属产业链" prop="chainId" label-width="100px">
        <el-select v-model="queryParams.chainId" placeholder="请选择所属产业链" clearable style="width: 180px">
          <el-option v-for="dict in chain" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <!-- <el-form-item label="企业类型" prop="companyType">
        <el-select v-model="queryParams.companyType" placeholder="请选择企业类型" clearable style="width: 180px">
          <el-option v-for="dict in company_type" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item> -->
      <el-form-item label="企业名称" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入企业名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="企业状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择企业状态" clearable style="width: 180px">
          <el-option v-for="dict in company_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          v-hasPermi="['company:management:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['company:management:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['company:management:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['company:management:export']">导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" plain icon="List" :disabled="single" @click="handleViewResources"
          v-hasPermi="['company:management:resources']">管理资源</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="managementList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="企业编号" align="center" prop="id" />
      <el-table-column label="所属产业链编号" align="center" prop="chainId">
        <template #default="scope">
          <dict-tag :options="chain" :value="scope.row.chainId" />
        </template>
      </el-table-column>
      <el-table-column label="企业类型" align="center" prop="companyType">
        <template #default="scope">
          <dict-tag :options="company_type" :value="scope.row.companyType" />
        </template>
      </el-table-column>
      <el-table-column label="企业名称" align="center" prop="name" />
      <el-table-column label="企业所在地" align="center" prop="address" />
      <el-table-column label="企业声誉" align="center" prop="reputation">
        <template #default="scope">
          {{ scope.row.reputation?.toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column label="企业状态" align="center" prop="status">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            <dict-tag :options="company_status" :value="scope.row.status" />
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['company:management:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['company:management:remove']">删除</el-button>
          <el-button v-if="scope.row.status === 3" link type="danger" icon="Warning"
            @click="handleViewAbnormal(scope.row)">
            查看异常信息
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改company对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="managementRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="所属产业链" prop="chainId">
          <el-select v-model="form.chainId" placeholder="请选择所属产业链">
            <el-option v-for="dict in chain" :key="dict.value" :label="dict.label"
              :value="parseInt(dict.value)"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="企业类型" prop="companyType">
          <el-select v-model="form.companyType" placeholder="请选择企业类型">
            <el-option v-for="dict in company_type" :key="dict.value" :label="dict.label"
              :value="parseInt(dict.value)"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="企业名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入企业名称" />
        </el-form-item>
        <el-form-item label="企业所在地" prop="address">
          <el-input v-model="form.address" placeholder="请输入企业所在地" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 异常信息对话框 -->
    <el-dialog title="企业异常信息" v-model="abnormalOpen" width="800px" append-to-body>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="企业名称">{{ abnormalInfo.name }}</el-descriptions-item>
        <el-descriptions-item label="企业编号">{{ abnormalInfo.id }}</el-descriptions-item>
        <el-descriptions-item label="所属产业链">
          <dict-tag :options="chain" :value="abnormalInfo.chainId" />
        </el-descriptions-item>
        <el-descriptions-item label="异常行为">
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            <el-tag v-for="item in abnormalInfo.abnormalBehaviors" :key="item.id" type="danger">
              {{ item.behavior }}
            </el-tag>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="异常任务">
          <el-table :data="abnormalInfo.abnormalTasks" style="width: 100%">
            <el-table-column prop="taskId" label="任务编号" width="120" />
            <el-table-column prop="taskName" label="任务名称" min-width="200" />
            <el-table-column prop="abnormalTime" label="异常时间" width="180" />
          </el-table>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="abnormalOpen = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 企业资源对话框 -->
    <el-dialog title="企业资源管理" v-model="resourceOpen" width="800px" append-to-body>
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button type="primary" plain icon="Plus" @click="handleAddResource">新增资源</el-button>
        </el-col>
      </el-row>

      <el-table v-loading="resourceLoading" :data="resourceList">
        <el-table-column label="资源编号" align="center" prop="resourceId" />
        <el-table-column label="资源名称" align="center" prop="resourceName" />
        <el-table-column label="资源型号" align="center" prop="resourceType" />
        <el-table-column label="资源数量" align="center" prop="number" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-button link type="primary" icon="Edit" @click="handleEditResource(scope.row)">修改数量</el-button>
            <el-button link type="primary" icon="Delete" @click="handleDeleteResource(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="resourceTotal > 0" :total="resourceTotal" v-model:page="resourceQueryParams.pageNum"
        v-model:limit="resourceQueryParams.pageSize" @pagination="getResourceList" />
    </el-dialog>

    <!-- 资源表单对话框 -->
    <el-dialog :title="resourceTitle" v-model="resourceFormOpen" width="500px" append-to-body>
      <el-form ref="resourceFormRef" :model="resourceForm" :rules="resourceRules" label-width="100px">
        <el-form-item label="资源" prop="resourceId" v-if="!resourceForm.isEdit">
          <el-select v-model="resourceForm.resourceId" placeholder="请选择资源" filterable remote
            :remote-method="handleResourceSearch" :loading="resourceSearchLoading">
            <el-option v-for="item in availableResources" :key="item.id" :label="`${item.name} (${item.resourceType})`"
              :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="资源数量" prop="number">
          <el-input-number v-model="resourceForm.number" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitResourceForm">确 定</el-button>
          <el-button @click="resourceFormOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Management">
import {addManagement, delManagement, getManagement, listManagement, updateManagement} from "@/api/company/management";
import {addResource, deleteResource, getResourceOptions, listResources, updateResource} from "@/api/company/resources";

const { proxy } = getCurrentInstance();
const { company_type, company_status, chain } = proxy.useDict('company_type', 'company_status', 'chain');

const managementList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const abnormalOpen = ref(false);
const abnormalInfo = ref({
  id: '',
  name: '',
  chainId: '',
  abnormalBehaviors: [],
  abnormalTasks: []
});

const resourceOpen = ref(false);
const resourceFormOpen = ref(false);
const resourceLoading = ref(false);
const resourceList = ref([]);
const availableResources = ref([]);
const resourceTitle = ref("");
const currentCompanyId = ref(null);

const resourceForm = ref({
  companyId: null,
  resourceId: null,
  number: 0,
  isEdit: false
});

const resourceRules = {
  resourceId: [{ required: true, message: '请选择资源', trigger: 'change' }],
  number: [{ required: true, message: '请输入资源数量', trigger: 'blur' }]
};

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    id: null,
    chainId: null,
    companyType: null,
    name: null,
    status: null
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

const getStatusType = (status) => {
  switch (status) {
    case 2:
      return 'success'
    case 0:
      return 'info'
    case 1:
      return 'warning'
    case 3:
      return 'danger'
  }
}

/** 查询company列表 */
function getList() {
  loading.value = true;
  listManagement(queryParams.value).then(response => {
    managementList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    chainId: null,
    companyType: null,
    name: null,
    address: null,
    reputation: null,
    status: null
  };
  proxy.resetForm("managementRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  form.value.reputation = 1.0;
  form.value.status = 0;
  open.value = true;
  title.value = "添加企业";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getManagement(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改企业信息";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["managementRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateManagement(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addManagement(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除company编号为"' + _ids + '"的数据项？').then(function () {
    return delManagement(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('company/management/export', {
    ...queryParams.value
  }, `management_${new Date().getTime()}.xlsx`)
}

/** 查看异常信息方法 */
function handleViewAbnormal(row) {
  // 这里模拟异常数据，实际项目中应该通过API获取
  abnormalInfo.value = {
    id: row.id,
    name: row.name,
    chainId: row.chainId,
    abnormalBehaviors: [
      { id: 1, behavior: '未按时交付资源' },
      { id: 2, behavior: '虚报资源信息' },
      { id: 3, behavior: '资源质量不合格' },
      { id: 4, behavior: '违反合同约定' },
      { id: 5, behavior: '恶意竞争' }
    ],
    abnormalTasks: [
      {
        taskId: 'T2024001',
        taskName: '零件生产任务A',
        abnormalTime: '2024-03-15 14:30:00'
      },
      {
        taskId: 'T2024002',
        taskName: '组件装配任务B',
        abnormalTime: '2024-03-16 09:15:00'
      }
    ]
  };
  abnormalOpen.value = true;
}

/** 查看资源按钮操作 */
function handleViewResources(row) {
  currentCompanyId.value = ids.value[0];
  // 重置分页参数
  resourceQueryParams.value.pageNum = 1;
  getResourceList();
  loadAvailableResources();
  resourceOpen.value = true;
}

/** 获取资源列表 */
function getResourceList() {
  resourceLoading.value = true;
  listResources(currentCompanyId.value, resourceQueryParams.value.pageNum,resourceQueryParams.value.pageSize).then(response => {
    resourceList.value = response.rows.map(item => ({
      resourceId: item.resourceId,
      resourceName: item.resource.name,
      resourceType: item.resource.resourceType,
      number: item.number
    }));
    resourceTotal.value = response.total;
    resourceLoading.value = false;
  });
}
const allResource=ref([]);
/** 处理资源搜索 */
function handleResourceSearch(query) {
  resourceSearchLoading.value = true;
  getResourceOptions(query).then(response => {
    // 过滤掉已有的资源
    const existingResourceIds = allResource.value.map(item => item.resourceId);
    availableResources.value = response.data.filter(
      resource => !existingResourceIds.includes(resource.id)
    );
    resourceSearchLoading.value = false;
  });
}

const getAllResource=(companyId)=>{
 return getAllResource(companyId).then(res=>{
    allResource.value=res.data;
  })
}

/** 加载可选资源 */
function loadAvailableResources() {
  resourceSearchLoading.value = true;
  getResourceOptions('').then(async response => {
    // 过滤掉已有的资源
    await getAllResource(currentCompanyId.value);
    const existingResourceIds = allResource.value.map(item => item.resourceId);
    availableResources.value = response.data.filter(
        resource => !existingResourceIds.includes(resource.id)
    );
    resourceSearchLoading.value = false;
  });
}

/** 新增资源 */
function handleAddResource() {
  // 重新加载可用资源列表，确保数据最新
  loadAvailableResources();

  resourceForm.value = {
    companyId: currentCompanyId.value,
    resourceId: null,
    number: 0,
    isEdit: false
  };
  resourceTitle.value = "新增资源";
  resourceFormOpen.value = true;
}

/** 修改资源数量 */
function handleEditResource(row) {
  resourceForm.value = {
    companyId: currentCompanyId.value,
    resourceId: row.resourceId,
    number: row.number,
    isEdit: true
  };
  resourceTitle.value = "修改资源数量";
  resourceFormOpen.value = true;
}

/** 删除资源 */
function handleDeleteResource(row) {
  proxy.$modal.confirm('是否确认删除该资源？').then(function () {
    return deleteResource(currentCompanyId.value, row.resourceId);
  }).then(() => {
    getResourceList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

/** 提交资源表单 */
function submitResourceForm() {
  proxy.$refs["resourceFormRef"].validate(valid => {
    if (valid) {
      if (resourceForm.value.isEdit) {
        updateResource(resourceForm.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          resourceFormOpen.value = false;
          getResourceList();
        });
      } else {
        addResource(resourceForm.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          resourceFormOpen.value = false;
          getResourceList();
        });
      }
    }
  });
}

const resourceTotal = ref(0);
const resourceQueryParams = ref({
  pageNum: 1,
  pageSize: 10
});

const resourceSearchLoading = ref(false);

getList();
</script>
