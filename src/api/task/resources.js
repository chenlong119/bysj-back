import request from "@/utils/request.js";

export function listResources(taskId,pageParams) {
    return request({
        url: "/task/management/resources/list/" + taskId,
        method: "get",
        params: pageParams
    });
}

export function getResourceOptions(query) {
    return request({
        url: "/task/management/resource/options",
        method: "get",
        params: {
            keyword: query,
        },
    });
}

export function addResource(data) {
    return request({
        url: "/task/management/resources",
        method: "post",
        data: data,
    });
}

export function updateResource(data) {
    return request({
        url: "/task/management/resources",
        method: "put",
        data: data,
    });
}

export function deleteResource(taskId, resourceId) {
    return request({
        url: `/task/management/resources/${taskId}/${resourceId}`,
        method: "delete",
    });
}

export function getAllResource(taskId){
    return request({
        url: `/task/management/resources/${taskId}`,
        method: "get",
    });
}