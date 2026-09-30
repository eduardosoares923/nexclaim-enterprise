/**
 * Remove valores `undefined` de um objeto, inclusive dentro de objetos e listas aninhados.
 * O Firestore recusa o documento inteiro se houver um único `undefined` em qualquer nível.
 * Só percorre objetos simples e listas (não mexe em Date, Timestamp, etc).
 */
export function removeUndefinedFields<T>(valor: T): T {
  if (Array.isArray(valor)) {
    return valor.filter((item) => item !== undefined).map((item) => removeUndefinedFields(item)) as unknown as T;
  }
  if (valor !== null && typeof valor === 'object' && Object.getPrototypeOf(valor) === Object.prototype) {
    const limpo: Record<string, any> = {};
    Object.keys(valor as Record<string, any>).forEach((chave) => {
      const item = (valor as Record<string, any>)[chave];
      if (item !== undefined) limpo[chave] = removeUndefinedFields(item);
    });
    return limpo as T;
  }
  return valor;
}
