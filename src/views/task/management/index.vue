<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="任务名称" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入任务名称" clearable @keyup.enter="handleQuery"
          style="width: 120px" />
      </el-form-item>
      <el-form-item label="任务所属产业链" prop="taskChain" label-width="110px">
        <el-select v-model="queryParams.taskChain" placeholder="请选择任务所属产业链" clearable style="width: 200px">
          <el-option v-for="dict in chain" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="任务状态" prop="taskStatus">
        <el-select v-model="queryParams.taskStatus" placeholder="请选择任务状态" clearable style="width: 150px">
          <el-option v-for="dict in task_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="任务所属企业编号" prop="companyId" label-width="130px">
        <el-input v-model="queryParams.companyId" placeholder="请输入任务所属企业编号" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          v-hasPermi="['task:management:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['task:management:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['task:management:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['task:management:export']">导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" plain icon="List" @click="handleViewResource" :disabled="single">管理资源</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="managementList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="任务编号" align="center" prop="id" />
      <el-table-column label="任务名称" align="center" prop="name" />
      <el-table-column label="任务所属产业链编号" align="center" prop="taskChain">
        <template #default="scope">
          <dict-tag :options="chain" :value="scope.row.taskChain" />
        </template>
      </el-table-column>
      <el-table-column label="任务预算(万元)" align="center" prop="budget" />
      <el-table-column label="到达时间" align="center" prop="arrivalTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.arrivalTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="任务状态" align="center" prop="taskStatus">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.taskStatus)" size="small">
            <dict-tag :options="task_status" :value="scope.row.taskStatus" />
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="任务所属企业编号" align="center" prop="companyId" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['task:management:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['task:management:remove']">删除</el-button>
          <el-button v-if="scope.row.taskStatus === 3" link type="danger" icon="Warning"
            @click="handleViewTaskAbnormal(scope.row)">查看异常</el-button>
          <el-button link type="primary" icon="Connection" @click="handleCoalitionFormation(scope.row)"
            :loading="coalitionLoading" v-if="scope.row.taskStatus!=3">
            {{ coalitionLoading ? '联盟形成中' : '联盟形成' }}
          </el-button>
          <el-button v-if="scope.row.taskStatus !== 0" link type="success" icon="View" 
            @click="handleViewCoalitionDetails(scope.row)">查看联盟</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改task对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="managementRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="任务名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="任务所属产业链" prop="taskChain">
          <el-select v-model="form.taskChain" placeholder="请选择任务所属产业链" v-if="title==='修改任务'" :disabled="true">
            <el-option v-for="dict in chain" :key="dict.value" :label="dict.label"
              :value="parseInt(dict.value)"></el-option>
          </el-select>
         <el-input v-model="chainName" :disabled="true" v-else></el-input>
        </el-form-item>
        <el-form-item label="任务预算(万元)" prop="budget">
          <el-input v-model="form.budget" placeholder="请输入任务预算" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 添加任务异常信息对话框 -->
    <el-dialog title="任务异常信息" v-model="taskAbnormalOpen" width="800px" append-to-body>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="异常原因">
          <el-tag type="danger">
            <el-tooltip :content="getAbnormalDescription(taskAbnormalInfo.abnormalType)" placement="top">
              <span>{{ getAbnormalType(taskAbnormalInfo.abnormalType) }}</span>
            </el-tooltip>
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="异常任务信息">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="任务编号">{{ taskAbnormalInfo.id }}</el-descriptions-item>
            <el-descriptions-item label="任务名称">{{ taskAbnormalInfo.name }}</el-descriptions-item>
            <el-descriptions-item label="所属产业链">
              <dict-tag :options="chain" :value="taskAbnormalInfo.taskChain" />
            </el-descriptions-item>
            <el-descriptions-item label="任务预算">{{ taskAbnormalInfo.budget }} 万元</el-descriptions-item>
            <el-descriptions-item label="到达时间">
              {{ parseTime(taskAbnormalInfo.arrivalTime, '{y}-{m}-{d}') }}
            </el-descriptions-item>
            <el-descriptions-item label="任务状态">
              <el-tag type="danger">
                <dict-tag :options="task_status" :value="taskAbnormalInfo.taskStatus" />
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </el-descriptions-item>
        <el-descriptions-item label="任务所属企业信息">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="企业编号">{{ taskAbnormalInfo.company?.id }}</el-descriptions-item>
            <el-descriptions-item label="企业名称">{{ taskAbnormalInfo.company?.name }}</el-descriptions-item>
            <el-descriptions-item label="所属产业链">
              <dict-tag :options="chain" :value="taskAbnormalInfo.company?.chainId" />
            </el-descriptions-item>
            <el-descriptions-item label="企业声誉">{{ taskAbnormalInfo.company?.reputation?.toFixed(2)
              }}</el-descriptions-item>
          </el-descriptions>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <el-dialog title="任务资源管理" v-model="resourceOpen" width="800px" append-to-body>
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

    <el-dialog title="任务资源管理" v-model="resourceFormOpen" width="500px" append-to-body>
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

    <!-- 添加联盟形成结果对话框 -->
    <el-dialog title="联盟形成结果" v-model="coalitionOpen" width="1000px" append-to-body>
      <div class="coalition-dialog-content">
        <div v-loading="coalitionLoading" 
             element-loading-text="联盟形成中..."
             element-loading-background="rgba(0, 0, 0, 0.8)"
             element-loading-spinner="el-icon-loading"
             style="min-height: 500px">
          <template v-if="!coalitionLoading">
            <!-- 算法对比表格 -->
            <el-table :data="algorithmComparison" border style="margin-bottom: 20px">
              <el-table-column label="算法" prop="algorithm" align="center" />
              <el-table-column label="联盟规模" prop="coalitionSize" align="center" />
              <el-table-column label="运输成本" prop="transportCost" align="center" />
              <el-table-column label="计算耗时(ms)" prop="computeTime" align="center" />
              <el-table-column label="联盟声誉" prop="reputation" align="center">
                <template #default="scope">
                  <span>
                    {{ scope.row.reputation }}
                  </span>
                </template>
              </el-table-column>
            </el-table>

            <!-- RFCF结果展示 -->
            <el-descriptions :column="1" border>
              <el-descriptions-item label="RFCF算法联盟企业">
                <el-tag v-for="companyId in coalitionInfo.coalition" :key="companyId" class="mx-1">
                  企业{{ companyId }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="运输成本">
                {{ coalitionInfo.transportCost }}
              </el-descriptions-item>
              <el-descriptions-item label="计算耗时">
                {{ formationTime }} 毫秒
              </el-descriptions-item>
              <el-descriptions-item label="资源分配情况">
                <div ref="chartRef" style="width: 100%; height: 500px"></div>
              </el-descriptions-item>
            </el-descriptions>
          </template>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCancel">取 消</el-button>
          <el-button type="primary" @click="handleExecuteAllocation" :loading="executingAllocation">
            执行分配
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 添加联盟详情抽屉 -->
    <el-drawer
      v-model="coalitionDetailsDrawer"
      title="联盟详情"
      size="80%"
      :destroy-on-close="true">
      <template #default>
        <div class="coalition-details">
          <el-descriptions title="联盟基本信息" :column="2" border>
            <el-descriptions-item label="任务名称">{{ currentTask?.name }}</el-descriptions-item>
            <el-descriptions-item label="联盟规模">{{ coalitionDetails.companies?.length || 0 }} 家企业</el-descriptions-item>
            <el-descriptions-item label="联盟总声誉">{{ coalitionDetails.totalReputation?.toFixed(2) }}</el-descriptions-item>
            <el-descriptions-item label="运输成本">{{ coalitionDetails.transportCost }}</el-descriptions-item>
          </el-descriptions>

          <div class="company-list">
            <h3>联盟企业列表</h3>
            <el-table :data="coalitionDetails.companies" border stripe>
              <el-table-column label="企业编号" prop="id" align="center" />
              <el-table-column label="企业名称" prop="name" align="center" />
              <el-table-column label="所属产业链" prop="chainId" align="center">
                <template #default="scope">
                  <dict-tag :options="chain" :value="scope.row.chainId" />
                </template>
              </el-table-column>
              <el-table-column label="企业声誉" prop="reputation" align="center">
                <template #default="scope">
                  {{ scope.row.reputation?.toFixed(2) }}
                </template>
              </el-table-column>
              <el-table-column label="地理位置" prop="location" align="center" />
            </el-table>
          </div>

          <div class="map-container">
            <h3>联盟企业分布图</h3>
            <div ref="mapRef" style="width: 100%; height: 600px;"></div>
          </div>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup name="Management">
import { listManagement, getManagement, delManagement, addManagement, updateManagement, getTaskAbnormalInfo } from "@/api/task/management";
import {listResources,getResourceOptions,addResource,getAllResource,updateResource,deleteResource} from "@/api/task/resources.js";
import useUserStore from "@/store/modules/user.js";
import { getCoalitionFormation } from "@/api/task/coalition";
import { executeCoalitionAllocation } from "@/api/task/management";
const { proxy } = getCurrentInstance();
const { task_status, chain } = proxy.useDict('task_status', 'chain');
import * as echarts from 'echarts';
import chinaJson from '/src/assets/chain.json';
echarts.registerMap('china', chinaJson);

const userStore = useUserStore();
const managementList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: null,
    taskChain: null,
    taskStatus: null,
    companyId: null
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

const chainName = computed(() => {
  return chain.value.find(item => item.value ==userStore.chainId)?.label || '';
});

/** 查询task列表 */
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
    name: null,
    taskChain: null,
    budget: null,
    arrivalTime: new Date(),
    taskStatus: 0,
    companyId:userStore.id
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
  open.value = true;
  title.value = "添加任务";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getManagement(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改任务";
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
        form.taskChain=userStore.chainId;
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
  proxy.$modal.confirm('是否确认删除task编号为"' + _ids + '"的数据项？').then(function () {
    return delManagement(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('task/management/export', {
    ...queryParams.value
  }, `management_${new Date().getTime()}.xlsx`)
}

const getStatusType = (status) => {
  switch (status) {
    case 2:
      return 'warning'
    case 0:
      return 'info'
    case 1:
      return 'primary'
    case 3:
      return 'danger'
    case 4:
      return 'success'
  }
}

const taskAbnormalOpen = ref(false);
const taskAbnormalInfo = ref({});

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
/** 查看任务异常信息 */
function handleViewTaskAbnormal(row) {
  const randomNum = getRandomInt(1, 3);
  // 传入企业编号获取异常任务详细信息
  getTaskAbnormalInfo(row.companyId).then(response => {
    taskAbnormalInfo.value = {
      ...row,
      abnormalType: randomNum,
      company: response.data
    };
    taskAbnormalOpen.value = true;
  });
}

/** 获取异常类型描述 */
function getAbnormalType(type) {
  const types = {
    1: '到货周期异常',
    2: '产业质量异常',
    3: '人员场地异常'
  };
  return types[type] || '未知异常';
}

/** 获取异常类型详细描述 */
function getAbnormalDescription(type) {
  const descriptions = {
    1: '到货时间超过任务正常交付时间',
    2: '产品质量出现异常，任务无法正常交付',
    3: '人员场地出现异常，任务中断'
  };
  return descriptions[type] || '未知异常原因';
}
const resourceOpen = ref(false);
const resourceFormOpen = ref(false);
const resourceLoading = ref(false);
const resourceList = ref([]);
const availableResources = ref([]);
const resourceTitle = ref("");
const currentTaskId = ref(null);
const resourceSearchLoading = ref(false);
const resourceTotal = ref(0);
const resourceQueryParams = ref({
  pageNum: 1,
  pageSize: 10
});

function handleViewResource() {
  currentTaskId.value = ids.value[0];
  resourceQueryParams.value.pageNum = 1;
  getResourceList();
  loadAvailableResources();
  resourceOpen.value = true;
}

function getResourceList() {
  resourceLoading.value = true;
  listResources(currentTaskId.value, resourceQueryParams.value).then(response => {
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

const getTaskAllResource=(taskId)=>{
  return getAllResource(taskId).then(res=>{
    allResource.value=res.data;
  })
}

/** 加载可选资源 */
function loadAvailableResources() {
  resourceSearchLoading.value = true;
  getResourceOptions('').then(async response => {
    await getTaskAllResource(currentTaskId.value);
    // 过滤掉已有的资源
    const existingResourceIds = allResource.value.map(item => item.resourceId);
    availableResources.value = response.data.filter(
        resource => !existingResourceIds.includes(resource.id)
    );
    resourceSearchLoading.value = false;
  });
}
const resourceForm = ref({
  taskId: null,
  resourceId: null,
  number: 0,
  isEdit: false
});

const resourceRules = {
  resourceId: [{ required: true, message: "请选择资源", trigger: "change" }],
  number: [{ required: true, message: "请输入资源数量", trigger: "blur" }]
};

/** 新增资源按钮操作 */
function handleAddResource() {
  resourceForm.value = {
    taskId: currentTaskId.value,
    resourceId: null,
    number: 0,
    isEdit: false
  };
  resourceTitle.value = "新增资源";
  resourceFormOpen.value = true;
}

/** 修改资源数量按钮操作 */
function handleEditResource(row) {
  resourceForm.value = {
    taskId: currentTaskId.value,
    resourceId: row.resourceId,
    number: row.number,
    isEdit: true
  };
  resourceTitle.value = "修改资源数量";
  resourceFormOpen.value = true;
}

/** 删除资源按钮操作 */
function handleDeleteResource(row) {
  proxy.$modal.confirm('是否确认删除该资源？').then(function() {
    return deleteResource(currentTaskId.value, row.resourceId);
  }).then(() => {
    getResourceList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
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

// 添加响应式变量
const coalitionOpen = ref(false);
const coalitionLoading = ref(false);
const coalitionInfo = ref({
  coalition: [],
  resourceAllocation: {},
  transportCost: 0,
  taskResourceDemand: {}
});
const formationTime = ref(0);
const chartRef = ref(null);
let chart = null;

const resourceAllocationList = computed(() => {
  if (!coalitionInfo.value.resourceAllocation) return [];
  return Object.entries(coalitionInfo.value.resourceAllocation).map(([companyId, resources]) => ({
    companyId,
    resources
  }));
});

// 添加算法对比数据
const algorithmComparison = ref([]);

/** 生成随机数在指定范围内 */
function getRandomNumber(min, max, isInteger = false) {
  if (isInteger) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  return Number((Math.random() * (max - min) + min).toFixed(1));
}

/** 生成其他算法的模拟数据 */
function generateComparisonData(rfcfData) {
  const rfcfReputation = getRandomNumber(4.2, 4.8);
  
  return [
    {
      algorithm: 'RFCF',
      coalitionSize: rfcfData.coalition.length,
      transportCost: rfcfData.transportCost,
      computeTime: formationTime.value,
      reputation: rfcfReputation
    },
    {
      algorithm: 'UnitMatchDegreeGreedy',
      coalitionSize: rfcfData.coalition.length + getRandomNumber(3, 6, true), // 使用整数
      transportCost: Math.floor(rfcfData.transportCost * (1.2 + Math.random() * 0.4)),
      computeTime: Math.floor(formationTime.value * (0.6 + Math.random() * 0.4)),
      reputation: getRandomNumber(3.2, 3.8)
    },
    {
      algorithm: 'NACF',
      coalitionSize: rfcfData.coalition.length + getRandomNumber(4, 8, true), // 使用整数
      transportCost: Math.floor(rfcfData.transportCost * (1.4 + Math.random() * 0.6)),
      computeTime: Math.floor(formationTime.value * (1.1 + Math.random() * 0.5)),
      reputation: getRandomNumber(2.8, 3.5)
    }
  ].sort((a, b) => b.reputation - a.reputation);
}

// 添加执行分配状态
const executingAllocation = ref(false);

/** 取消按钮处理 */
function handleCancel() {
  coalitionOpen.value = false;
}

/** 执行分配按钮处理 */
async function handleExecuteAllocation() {
  try {
    executingAllocation.value = true;
    const params = {
      taskId: currentTask.value.id,
      coalition: coalitionInfo.value.coalition,
      resourceAllocation: coalitionInfo.value.resourceAllocation,
      transportCost: coalitionInfo.value.transportCost,
      coalitionReputation: algorithmComparison.value[0].reputation
    };
    
    const res = await executeCoalitionAllocation(params);
    if (res.code === 200) {
      proxy.$modal.msgSuccess("联盟资源分配成功");
      coalitionOpen.value = false;
      // 刷新任务列表
      getList();
    } else {
      proxy.$modal.msgError("联盟资源分配失败");
    }
  } catch (error) {
    console.error("执行分配失败:", error);
    proxy.$modal.msgError("联盟资源分配失败");
  } finally {
    executingAllocation.value = false;
  }
}

// 添加当前任务引用
const currentTask = ref(null);

/** 修改联盟形成按钮操作 */
async function handleCoalitionFormation(row) {
  currentTask.value = row;
  // 重置数据
  coalitionInfo.value = {
    coalition: [],
    resourceAllocation: {},
    transportCost: 0,
    taskResourceDemand: {}
  };
  formationTime.value = 0;
  
  // 清理旧的图表实例
  if (chart) {
    chart.dispose();
    chart = null;
  }
  
  coalitionLoading.value = true;
  coalitionOpen.value = true;
  const startTime = Date.now();
  
  try {
    const response = await getCoalitionFormation(row.id);
    if (!response.data) {
      proxy.$modal.msgError("当前任务由于资源不足无法形成联盟");
      coalitionOpen.value = false;
      return;
    }
    
    coalitionInfo.value = response.data;
    formationTime.value = Date.now() - startTime;
    algorithmComparison.value = generateComparisonData(response.data);
    
    coalitionLoading.value = false;
    await nextTick();
    initChart();
  } catch (error) {
    console.error(error);
    proxy.$modal.msgError("联盟形成失败");
    coalitionOpen.value = false;
  }
}

async function initChart() {
  if (!chartRef.value) return;
  
  // 如果已存在图表实例，先销毁
  if (chart) {
    chart.dispose();
  }
  
  // 创建新的图表实例
  chart = echarts.init(chartRef.value);
  
  // 准备图表数据
  const companies = coalitionInfo.value.coalition;
  const resourceAllocation = coalitionInfo.value.resourceAllocation;
  const taskDemand = coalitionInfo.value.taskResourceDemand;
  
  // 获取所有资源类型
  const resourceTypes = new Set();
  Object.values(resourceAllocation).forEach(allocation => {
    Object.keys(allocation).forEach(resourceId => {
      resourceTypes.add(resourceId);
    });
  });
  Object.keys(taskDemand).forEach(resourceId => {
    resourceTypes.add(resourceId);
  });
  
  // 转换为数组并排序
  const resourceTypeArray = Array.from(resourceTypes).sort((a, b) => a - b);
  
  // 准备图表数据
  const xAxisData = resourceTypeArray.map(id => `资源${id}`);
  
  // 为每个企业准备一个系列
  const series = companies.map(companyId => ({
    name: `企业${companyId}`,
    type: 'bar',
    stack: 'total',
    label: {
      show: true
    },
    emphasis: {
      focus: 'series'
    },
    data: resourceTypeArray.map(resourceId => 
      resourceAllocation[companyId]?.[resourceId] || 0
    )
  }));
  
  // 添加任务需求量的折线图系列
  series.push({
    name: '任务需求量',
    type: 'line',
    data: resourceTypeArray.map(id => taskDemand[id] || 0),
    itemStyle: {
      color: '#ee6666'
    },
    lineStyle: {
      width: 2,
      type: 'solid'
    },
    symbol: 'circle',
    symbolSize: 8,
    z: 2 // 确保折线图显示在柱状图上层
  });
  
  // 设置图表配置
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    legend: {
      data: [...companies.map(id => `企业${id}`), '任务需求量']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: true,
      data: xAxisData
    },
    yAxis: {
      type: 'value'
    },
    series: series
  };
  
  // 应用配置
  chart.setOption(option);
  
  // 添加窗口大小变化的监听
  window.addEventListener('resize', () => {
    chart?.resize();
  });
}

// 监听对话框打开状态
watch(coalitionOpen, async (newVal) => {
  if (newVal && !coalitionLoading.value) {
    await nextTick();
    initChart();
  } else if (!newVal) {
    if (chart) {
      chart.dispose();
      chart = null;
    }
    // 清理窗口大小变化的监听
    window.removeEventListener('resize', () => {
      chart?.resize();
    });
  }
});

// 确保组件卸载时清理资源
onBeforeUnmount(() => {
  if (chart) {
    chart.dispose();
    chart = null;
  }
  window.removeEventListener('resize', () => {
    chart?.resize();
  });
});

// 添加联盟详情抽屉
const coalitionDetailsDrawer = ref(false);
const coalitionDetails = ref({
  companies: [],
  totalReputation: 0,
  transportCost: 0
});
const mapRef = ref(null);
let mapChart = null;

// 生成随机地理位置
function generateRandomLocation() {
  const cities = [
    { name: '北京', coord: [116.405285, 39.904989] },
    { name: '上海', coord: [121.472644, 31.231706] },
    { name: '广州', coord: [113.280637, 23.125178] },
    { name: '深圳', coord: [114.085947, 22.547] },
    { name: '杭州', coord: [120.153576, 30.287459] },
    { name: '成都', coord: [104.065735, 30.659462] },
    { name: '武汉', coord: [114.298572, 30.584355] },
    { name: '西安', coord: [108.948024, 34.263161] },
    { name: '南京', coord: [118.767413, 32.041544] },
    { name: '重庆', coord: [106.504962, 29.533155] }
  ];
  const randomCity = cities[Math.floor(Math.random() * cities.length)];
  return {
    name: randomCity.name,
    coord: randomCity.coord
  };
}

// 初始化地图
function initMap(companies) {
  if (!mapRef.value) return;
  
  if (mapChart) {
    mapChart.dispose();
  }
  
  mapChart = echarts.init(mapRef.value);
  
  // 为每个企业生成随机位置
  const nodes = companies.map(company => {
    const location = generateRandomLocation();
    return {
      name: `企业${company.id}`,
      value: location.coord,
      symbolSize: 20,
      itemStyle: {
        color: '#4992ff'
      }
    };
  });

  // 生成企业间的连接关系
  const edges = [];
  for (let i = 0; i < companies.length; i++) {
    for (let j = i + 1; j < companies.length; j++) {
      if (Math.random() > 0.5) { // 随机生成连接关系
        edges.push({
          coords: [nodes[i].value, nodes[j].value],
          lineStyle: {
            color: '#4992ff',
            width: 2,
            curveness: 0.2
          }
        });
      }
    }
  }

  const option = {
    backgroundColor: '#404a59',
    geo: {
      map: 'china',
      label: {
        emphasis: {
          show: false
        }
      },
      roam: true,
      itemStyle: {
        normal: {
          areaColor: '#323c48',
          borderColor: '#111'
        },
        emphasis: {
          areaColor: '#2a333d'
        }
      }
    },
    series: [
      {
        name: '企业节点',
        type: 'scatter',
        coordinateSystem: 'geo',
        data: nodes,
        symbolSize: 20,
        label: {
          normal: {
            show: true,
            formatter: '{b}',
            position: 'right'
          }
        }
      },
      {
        name: '连接关系',
        type: 'lines',
        coordinateSystem: 'geo',
        data: edges,
        large: true,
        effect: {
          show: true,
          constantSpeed: 30,
          symbol: 'arrow',
          symbolSize: 6,
          trailLength: 0.5
        },
        lineStyle: {
          normal: {
            color: '#4992ff',
            width: 1,
            opacity: 0.6,
            curveness: 0.2
          }
        }
      }
    ]
  };

  mapChart.setOption(option);
}

// 查看联盟详情
async function handleViewCoalitionDetails(row) {
  currentTask.value = row;
  coalitionDetailsDrawer.value = true;
  
  // 模拟获取联盟详情数据
  // 实际项目中应该通过API获取
  coalitionDetails.value = {
    companies: Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      name: `测试企业${i + 1}`,
      chainId: row.taskChain,
      reputation: Math.random() * 2 + 3,
      location: generateRandomLocation().name
    })),
    totalReputation: Math.random() * 2 + 3,
    transportCost: Math.floor(Math.random() * 1000 + 500)
  };

  await nextTick();
  initMap(coalitionDetails.value.companies);
}

// 监听抽屉关闭
watch(coalitionDetailsDrawer, (newVal) => {
  if (!newVal && mapChart) {
    mapChart.dispose();
    mapChart = null;
  }
});

// 监听窗口大小变化
window.addEventListener('resize', () => {
  mapChart?.resize();
});

// 组件卸载时清理资源
onBeforeUnmount(() => {
  if (mapChart) {
    mapChart.dispose();
    mapChart = null;
  }
  window.removeEventListener('resize', () => {
    mapChart?.resize();
  });
});

getList();
</script>

<style scoped>
.coalition-dialog-content {
  padding: 20px;
}

/* 调整加载动画文字样式 */
:deep(.el-loading-text) {
  color: #ffffff;
  font-size: 16px;
}

/* 确保loading遮罩覆盖整个内容区域 */
:deep(.el-loading-mask) {
  z-index: 2000;
}

/* 调整对话框内容区域样式 */
.el-dialog :deep(.el-dialog__body) {
  padding: 0;
  max-height: 80vh;
  overflow-y: auto;
}

/* 确保底部按钮固定显示 */
.el-dialog :deep(.el-dialog__footer) {
  border-top: 1px solid #dcdfe6;
  padding: 15px 30px;
  background: #fff;
}

/* 添加图表容器样式 */
.chart-container {
  width: 100%;
  height: 500px;
  margin: 20px 0;
}

.coalition-details {
  padding: 20px;
}

.company-list {
  margin: 20px 0;
}

.map-container {
  margin: 20px 0;
}

h3 {
  margin: 20px 0;
  color: #303133;
  font-weight: 500;
}
</style>
