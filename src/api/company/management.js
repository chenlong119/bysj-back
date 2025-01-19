import request from '@/utils/request'

// 查询company列表
export function listManagement(query) {
  return request({
    url: '/company/management/list',
    method: 'get',
    params: query
  })
}

// 查询company详细
export function getManagement(id) {
  return request({
    url: '/company/management/' + id,
    method: 'get'
  })
}

// 新增company
export function addManagement(data) {
  return request({
    url: '/company/management',
    method: 'post',
    data: data
  })
}

// 修改company
export function updateManagement(data) {
  return request({
    url: '/company/management',
    method: 'put',
    data: data
  })
}

// 删除company
export function delManagement(id) {
  return request({
    url: '/company/management/' + id,
    method: 'delete'
  })
}
