// src/domain/repositories/input-repository.ts
import { UUID } from '../value-objects/uuid';
import { FileInput } from '../entities/file-input';
import { SpeechInput } from '../entities/speech-input';

/**
 * 输入仓库接口
 * 用于处理文件输入和语音输入的存储和查询
 */
export interface InputRepository {
  /**
   * 保存文件输入
   * @param fileInput 文件输入实体
   */
  saveFileInput(fileInput: FileInput): Promise<FileInput>;

  /**
   * 保存语音输入
   * @param speechInput 语音输入实体
   */
  saveSpeechInput(speechInput: SpeechInput): Promise<SpeechInput>;

  /**
   * 根据ID获取文件输入
   * @param id 文件输入ID
   * @returns 文件输入实体或null
   */
  getFileInputById(id: UUID): Promise<FileInput | null>;

  /**
   * 根据ID获取语音输入
   * @param id 语音输入ID
   * @returns 语音输入实体或null
   */
  getSpeechInputById(id: UUID): Promise<SpeechInput | null>;

  /**
   * 获取用户的所有输入历史
   * @param userId 用户ID
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 输入历史列表
   */
  getUserInputHistory(
    userId: UUID,
    limit: number,
    offset: number
  ): Promise<Array<FileInput | SpeechInput>>;

  /**
   * 获取用户的文件输入历史
   * @param userId 用户ID
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 文件输入历史列表
   */
  getUserFileInputHistory(
    userId: UUID,
    limit: number,
    offset: number
  ): Promise<FileInput[]>;

  /**
   * 获取用户的语音输入历史
   * @param userId 用户ID
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 语音输入历史列表
   */
  getUserSpeechInputHistory(
    userId: UUID,
    limit: number,
    offset: number
  ): Promise<SpeechInput[]>;

  /**
   * 获取用户的输入统计信息
   * @param userId 用户ID
   * @returns 输入统计信息
   */
  getUserInputStatistics(userId: UUID): Promise<{
    totalInputs: number;
    fileInputs: number;
    speechInputs: number;
    totalSize: number;
    averageInputSize: number;
    latestInputAt: Date | null;
  }>;

  /**
   * 删除输入
   * @param id 输入ID
   * @returns 是否删除成功
   */
  deleteInput(id: UUID): Promise<boolean>;

  /**
   * 批量删除输入
   * @param ids 输入ID列表
   * @returns 删除成功的数量
   */
  deleteInputs(ids: UUID[]): Promise<number>;

  /**
   * 搜索用户的输入
   * @param userId 用户ID
   * @param keyword 搜索关键词
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 匹配的输入列表
   */
  searchUserInputs(
    userId: UUID,
    keyword: string,
    limit: number,
    offset: number
  ): Promise<Array<FileInput | SpeechInput>>;
}