import { ApiService } from "./ApiService"
import { InputJson, SaveDataRequestGeneric } from "./apiService_types"
import { dataMapping } from "./mapping"
import { createSectionRequest } from "./parse_Doxcelljson"

/**
 * Заполняет все секции в Ficto. Возвращает { success: true } при успешном выполнении.
 */
export async function FictioFill(inputJson: InputJson): Promise<{ success: true }> {
  const api = new ApiService()

  // Извлекаем логин и пароль из inputJson
  const email = inputJson.fictoLogin
  const password = inputJson.fictoPass

  // Получаем init-токены
  const { access_token } = await api.login(email, password)
  const uuid = await api.getUuid(access_token)
  const initTokens = await api.getInitTokens(uuid, access_token)

  if (initTokens.length < 2) {
    throw new Error(`Ожидалось минимум 2 initTokens, получили ${initTokens.length}`)
  }

  // Проверяем и снимаем блокировку документа (фиксированный panel_id = 3289)
  const statusToken = initTokens[initTokens.length - 1]
  const fixedPanelId = 3289
  const docStatus = await api.getDocumentStatus(statusToken)

  if (docStatus.document.disabled_complite) {
    try {
      await api.cancelDocumentLock(
        docStatus.document.build_id,
        fixedPanelId,
        statusToken
      )
    } catch (err: any) {
      const msg = err.message || ""
      // Если статус 409 и запрещено изменение статуса — документ уже подписан
      if (
        msg.includes("Статус 409") &&
        msg.includes("запрещено изменение статуса отчета")
      ) {
        console.log("Документ подписан, вызываем revokeSignature…")
        await api.revokeSignature(
          docStatus.document.build_id,
          fixedPanelId,
          statusToken
        )
      } else {
        throw err
      }
    }
  }

  // Получаем все ключи секций, включая новую секцию 11
  const sectionKeys = Object.keys(dataMapping) as Array<keyof typeof dataMapping>
  
  // Заполняем каждую секцию по порядку
  for (
    let idx = 0;
    idx < initTokens.length - 1 && idx < sectionKeys.length;
    idx++
  ) {
    const token = initTokens[idx]
    const sectionKey = sectionKeys[idx]
    
    // Создаем запрос на основе ключа секции
    const requestData = createSectionRequest(
      sectionKey,
      inputJson
    ) as SaveDataRequestGeneric
    
    // Отправляем данные
    await api.saveData(token, requestData)
  }

  return { success: true }
}
