import request from "@/utils/request";

// 查询task列表
export function listManagement(query) {
  return request({
    url: "/task/management/list",
    method: "get",
    params: query,
  });
}

// 查询task详细
export function getManagement(id) {
  return request({
    url: "/task/management/" + id,
    method: "get",
  });
}

// 新增task
export function addManagement(data) {
  return request({
    url: "/task/management",
    method: "post",
    data: data,
  });
}

// 修改task
export function updateManagement(data) {
  return request({
    url: "/task/management",
    method: "put",
    data: data,
  });
}

// 删除task
export function delManagement(id) {
  return request({
    url: "/task/management/" + id,
    method: "delete",
  });
}

// 获取任务异常信息
export function getTaskAbnormalInfo(companyId) {
  return request({
    url: "/task/management/abnormal/company/" + companyId,
    method: "get",
  });
}

// 执行联盟资源分配
export function executeCoalitionAllocation(data) {
  return request({
    url: '/task/management/coalition/execute',
    method: 'post',
    data: data
  })
}
