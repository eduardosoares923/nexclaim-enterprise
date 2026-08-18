import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { firebaseService } from '../services/firebase';
import { Claim, Fine, Term, Vehicle, Person } from '../types';
import { WorkOrder } from '../views/WorkOrdersView';

// ==========================================
// CLAIMS HOOKS
// ==========================================
export function useClaims() {
  return useQuery<Claim[]>({
    queryKey: ['claims'],
    queryFn: () => firebaseService.fetchClaims(),
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
export function useFines() {
  return useQuery<Fine[]>({
    queryKey: ['fines'],
    queryFn: () => firebaseService.fetchFines(),
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
// TERMS HOOKS
// ==========================================
export function useTerms() {
  return useQuery<Term[]>({
    queryKey: ['terms'],
    queryFn: () => firebaseService.fetchTerms(),
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
export function useVehicles() {
  return useQuery<Vehicle[]>({
    queryKey: ['vehicles'],
    queryFn: () => firebaseService.fetchVehicles(),
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vehicleData: Omit<Vehicle, 'id'>) => {
      console.log('[DIAG] mutationFn useCreateVehicle chamada com:', vehicleData);
      return firebaseService
        .saveVehicle(vehicleData)
        .then((result) => {
          console.log('[DIAG] saveVehicle retornou:', result);
          return result;
        })
        .catch((err) => {
          console.error('[DIAG] saveVehicle rejeitou:', err);
          throw err;
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
    onError: (err) => console.error('[DIAG] useCreateVehicle onError:', err),
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
export function usePeople() {
  return useQuery<Person[]>({
    queryKey: ['people'],
    queryFn: () => firebaseService.fetchPeople(),
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
export function useWorkOrders() {
  return useQuery<WorkOrder[]>({
    queryKey: ['workOrders'],
    queryFn: () => firebaseService.fetchWorkOrders(),
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
