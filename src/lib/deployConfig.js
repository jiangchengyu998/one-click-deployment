export function getJenkinsDeployNode() {
    return process.env.JENKINS_DEPLOY_NODE || 'w-ubuntu';
}
