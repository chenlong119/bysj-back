import request from "@/utils/request.js";

// 查询企业资源列表
export function listResources(companyId,pageNum,pageSize) {
  return request({
    url: "/company/management/resources/list/" + companyId,
    method: "get",
    params:{
      pageNum,
      pageSize
    }
  });
}

export function getResourceOptions(query) {
  return request({
    url: "/company/management/resource/options",
    method: "get",
    params: {
      keyword: query,
    },
  });
}

// 新增企业资源
export function addResource(data) {
  return request({
    url: "/company/management/resources",
    method: "post",
    data: data,
  });
}

// 修改企业资源
export function updateResource(data) {
  return request({
    url: "/company/management/resources",
    method: "put",
    data: data,
  });
}

// 删除企业资源
export function deleteResource(companyId, resourceId) {
  return request({
    url: `/company/management/resources/${companyId}/${resourceId}`,
    method: "delete",
  });
}

export function getAllResource(companyId){
  return request({
    url: `/company/management/resources/${companyId}`,
    method: "get",
  });
}
