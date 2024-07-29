import { PropertyId } from "./constants";

/** 实现了一个键值对集合,用于存储和管理属性。
提供了获取、设置、克隆和合并属性的方法。
支持使用字符串或数字类型的键。 */
export class PropertyCollection {
  private privKeys: string[] = [];
  private privValues: string[] = [];

  // 获取属性值
  public getProperty(key: string | number, def?: string): string | undefined {
      let keyToUse: string;
      keyToUse = typeof key === "string" ? key : PropertyId[key]; // 假设 PropertyId 是一个已定义的枚举

      for (let n = 0; n < this.privKeys.length; n++) {
          if (this.privKeys[n] === keyToUse) {
              return this.privValues[n];
          }
      }

      if (def !== undefined) {
          return String(def);
      }
  }

  // 设置属性值
  public setProperty(key: string | number, value: string): void {
      let keyToUse: string;
      keyToUse = typeof key === "string" ? key : PropertyId[key];

      for (let n = 0; n < this.privKeys.length; n++) {
          if (this.privKeys[n] === keyToUse) {
              this.privValues[n] = value;
              return;
          }
      }

      this.privKeys.push(keyToUse);
      this.privValues.push(value);
  }

  // 克隆属性集合
  public clone(): PropertyCollection {
      const clonedMap = new PropertyCollection();
      for (let n = 0; n < this.privKeys.length; n++) {
          clonedMap.privKeys.push(this.privKeys[n]);
          clonedMap.privValues.push(this.privValues[n]);
      }
      return clonedMap;
  }

  // 合并到目标属性集合
  public mergeTo(destinationCollection: PropertyCollection): void {
      this.privKeys.forEach((key) => {
          if (destinationCollection.getProperty(key, undefined) === undefined) {
              const value = this.getProperty(key);
              if (value !== undefined) {
                  destinationCollection.setProperty(key, value);
              }
          }
      });
  }

  // 获取所有键
  public get keys(): string[] {
      return this.privKeys;
  }
}