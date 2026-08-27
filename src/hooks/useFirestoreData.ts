import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { firebaseService } from '../services/firebase';
import { Claim, Fine, Term, Vehicle, Person, InfractionType, FinancialEntry, DocumentTemplate } from '../types';
import { WorkOrder } from '../views/WorkOrdersView';

// ==========================================
// CLAIMS HOOKS
// ==========================================
export function useClaims(enabled: boolean = true) {
  return useQuery<Claim[]>({
    queryKey: ['claims'],
    queryFn: () => firebaseService.fetchClaims(),
    enabled,
  });
}

export function useCreateClaim() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (claimData: Omit<Claim, 'id'>) => firebaseService.saveClaim(claimData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
    },
  });
}

export function useUpdateClaim() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Claim> }) =>
      firebaseService.updateClaim(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
    },
  });
}

export function useDeleteClaim() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => firebaseService.deleteClaim(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
    },
  });
}

// ==========================================
// FINES HOOKS
// ==========================================
export function useFines(enabled: boolean = true) {
  return useQuery<Fine[]>({
    queryKey: ['fines'],
    queryFn: () => firebaseService.fetchFines(),
    enabled,
  });
}

export function useCreateFine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (fineData: Omit<Fine, 'id'>) => firebaseService.saveFine(fineData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fines'] });
    },
  });
}

export function useUpdateFine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Fine> }) =>
      firebaseService.updateFine(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fines'] });
    },
  });
}

export function useDeleteFine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => firebaseService.deleteFine(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fines'] });
    },
  });
}

// ==========================================
// INFRACTION TYPES HOOKS
// ==========================================
export function useInfractionTypes(enabled: boolean = true) {
  return useQuery<InfractionType[]>({
    queryKey: ['infractionTypes'],
    queryFn: () => firebaseService.fetchInfractionTypes(),
    enabled,
  });
}

export function useCreateInfractionType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<InfractionType, 'id'>) => firebaseService.saveInfractionType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['infractionTypes'] });
    },
  });
}

export function useUpdateInfractionType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InfractionType> }) =>
      firebaseService.updateInfractionType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['infractionTypes'] });
    },
  });
}

export function useDeleteInfractionType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => firebaseService.deleteInfractionType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['infractionTypes'] });
    },
  });
}

// ==========================================
// TERMS HOOKS
// ==========================================
export function useTerms(enabled: boolean = true) {
  return useQuery<Term[]>({
    queryKey: ['terms'],
    queryFn: () => firebaseService.fetchTerms(),
    enabled,
  });
}

export function useCreateTerm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (termData: Omit<Term, 'id'>) => firebaseService.saveTerm(termData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['terms'] });
    },
  });
}

export function useUpdateTerm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Term> }) =>
      firebaseService.updateTerm(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['terms'] });
    },
  });
}

export function useDeleteTerm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => firebaseService.deleteTerm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['terms'] });
    },
  });
}

// ==========================================
// VEHICLES HOOKS
// ==========================================
export function useVehicles(enabled: boolean = true) {
  return useQuery<Vehicle[]>({
    queryKey: ['vehicles'],
    queryFn: () => firebaseService.fetchVehicles(),
    enabled,
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vehicleData: Omit<Vehicle, 'id'>) => firebaseService.saveVehicle(vehicleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Vehicle> }) =>
      firebaseService.updateVehicle(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => firebaseService.deleteVehicle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}

// ==========================================
// PEOPLE HOOKS
// ==========================================
export function usePeople(enabled: boolean = true) {
  return useQuery<Person[]>({
    queryKey: ['people'],
    queryFn: () => firebaseService.fetchPeople(),
    enabled,
  });
}

export function useCreatePerson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (personData: Omit<Person, 'id'>) => firebaseService.savePerson(personData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
    },
  });
}

export function useUpdatePerson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Person> }) =>
      firebaseService.updatePerson(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
    },
  });
}

export function useDeletePerson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => firebaseService.deletePerson(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
    },
  });
}

// ==========================================
// WORK ORDERS HOOKS (OS & ORÇAMENTOS)
// ==========================================
export function useWorkOrders(enabled: boolean = true) {
  return useQuery<WorkOrder[]>({
    queryKey: ['workOrders'],
    queryFn: () => firebaseService.fetchWorkOrders(),
    enabled,
  });
}

export function useCreateWorkOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<WorkOrder, 'id'>) => firebaseService.saveWorkOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workOrders'] });
    },
  });
}

export function useUpdateWorkOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<WorkOrder> }) =>
      firebaseService.updateWorkOrder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workOrders'] });
    },
  });
}

export function useDeleteWorkOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => firebaseService.deleteWorkOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workOrders'] });
    },
  });
}

// ==========================================
// FINANCIAL ENTRIES HOOKS (MÓDULO FINANCEIRO)
// ==========================================
export function useFinancialEntries(enabled: boolean = true) {
  return useQuery<FinancialEntry[]>({
    queryKey: ['financialEntries'],
    queryFn: () => firebaseService.fetchFinancialEntries(),
    enabled,
  });
}

export function useCreateFinancialEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<FinancialEntry, 'id'>) => firebaseService.saveFinancialEntry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financialEntries'] });
    },
  });
}

export function useUpdateFinancialEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FinancialEntry> }) =>
      firebaseService.updateFinancialEntry(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financialEntries'] });
    },
  });
}

export function useDeleteFinancialEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => firebaseService.deleteFinancialEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financialEntries'] });
    },
  });
}

// ==========================================
// DOCUMENT TEMPLATES HOOKS
// ==========================================
export function useTemplates(enabled: boolean = true) {
  return useQuery<DocumentTemplate[]>({
    queryKey: ['documentTemplates'],
    queryFn: () => firebaseService.fetchTemplates(),
    enabled,
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<DocumentTemplate, 'id'>) => firebaseService.saveTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentTemplates'] });
    },
  });
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<DocumentTemplate> }) =>
      firebaseService.updateTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentTemplates'] });
    },
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => firebaseService.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentTemplates'] });
    },
  });
}
