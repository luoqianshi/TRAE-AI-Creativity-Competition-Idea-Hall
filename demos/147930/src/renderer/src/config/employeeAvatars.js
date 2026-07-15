import commonContentOperatorAvatar from '../assets/employeeAvatars/common-content-operator.png'
import commonDataAnalystAvatar from '../assets/employeeAvatars/common-data-analyst.jpg'
import commonFrontendDeveloperAvatar from '../assets/employeeAvatars/common-frontend-developer.png'
import commonProductManagerAvatar from '../assets/employeeAvatars/common-product-manager.jpg'
import commonQaEngineerAvatar from '../assets/employeeAvatars/common-qa-engineer.png'
import commonSoftwareDeveloperAvatar from '../assets/employeeAvatars/common-software-developer.png'
import devopsEngineerAvatar from '../assets/employeeAvatars/devops-engineer.jpg'
import projectAdministratorAvatar from '../assets/employeeAvatars/project-administrator.jpg'
import uxUiDesignerAvatar from '../assets/employeeAvatars/ux-ui-designer.jpg'

export const employeeAvatarMap = {
  'common-content-operator': commonContentOperatorAvatar,
  'common-data-analyst': commonDataAnalystAvatar,
  'common-frontend-developer': commonFrontendDeveloperAvatar,
  'common-product-manager': commonProductManagerAvatar,
  'common-qa-engineer': commonQaEngineerAvatar,
  'common-software-developer': commonSoftwareDeveloperAvatar,
  'devops-engineer': devopsEngineerAvatar,
  'project-administrator': projectAdministratorAvatar,
  'ux-ui-designer': uxUiDesignerAvatar
}

export function getEmployeeAvatarUrl(employee) {
  const avatarKey = String(employee?.avatarKey || employee?.employeeKey || '').trim()

  return employeeAvatarMap[avatarKey] || ''
}
