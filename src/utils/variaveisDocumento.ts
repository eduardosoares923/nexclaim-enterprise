export const ROTULOS_VARIAVEIS: Record<string, string> = {
  '{{nome_condutor}}': 'Nome do Condutor',
  '{{cpf_condutor}}': 'CPF do Condutor',
  '{{placa}}': 'Placa',
  '{{prefixo}}': 'Prefixo',
  '{{modelo_veiculo}}': 'Modelo do Veículo',
  '{{auto_infracao}}': 'Auto de Infração',
  '{{data_infracao}}': 'Data da Infração',
  '{{horario_infracao}}': 'Horário da Infração',
  '{{motivo_infracao}}': 'Motivo da Infração',
  '{{valor_infracao}}': 'Valor da Infração',
  '{{valor_total}}': 'Valor Total',
  '{{valor_total_extenso}}': 'Valor Total por Extenso',
  '{{opcao_cota_unica}}': 'Marcador Cota Única',
  '{{opcao_parcelado}}': 'Marcador Parcelado',
  '{{data_vencimento}}': 'Data de Vencimento',
  '{{numero_parcelas}}': 'Número de Parcelas',
  '{{valor_parcela}}': 'Valor da Parcela',
  '{{data_primeira_parcela}}': 'Data da 1ª Parcela',
  '{{dia_assinatura}}': 'Dia da Assinatura',
  '{{mes_assinatura}}': 'Mês da Assinatura',
  '{{numero_ocorrencia}}': 'Número da Ocorrência',
  '{{data_sinistro}}': 'Data do Sinistro',
  '{{hora_sinistro}}': 'Hora do Sinistro',
  '{{local_sinistro}}': 'Local do Sinistro',
  '{{cidade}}': 'Cidade',
  '{{estado}}': 'Estado',
  '{{placa_terceiro}}': 'Placa do Terceiro',
  '{{modelo_veiculo_terceiro}}': 'Modelo do Veículo do Terceiro',
};

export function rotuloDaVariavel(variavel: string): string {
  return ROTULOS_VARIAVEIS[variavel] || variavel.replace(/[{}]/g, '').replace(/_/g, ' ');
}
