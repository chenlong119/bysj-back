import request from '@/utils/request'

// 获取联盟形成结果
export function getCoalitionFormation(taskId) {
  return request({
    url: `/task/management/coalition/formation/${taskId}`,
    method: 'get'
  })
} 