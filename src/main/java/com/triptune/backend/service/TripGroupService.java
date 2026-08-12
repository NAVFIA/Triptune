package com.triptune.backend.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.triptune.backend.dto.group.ExpenseSplitResponse;
import com.triptune.backend.dto.group.TripExpenseCreateRequest;
import com.triptune.backend.dto.group.TripPhotoCreateRequest;
import com.triptune.backend.entity.Trip;
import com.triptune.backend.entity.TripExpense;
import com.triptune.backend.entity.TripPhoto;
import com.triptune.backend.entity.User;
import com.triptune.backend.repository.TripRepository;
import com.triptune.backend.repository.TripExpenseRepository;
import com.triptune.backend.repository.TripPhotoRepository;
import com.triptune.backend.repository.UserRepository;

@Service
public class TripGroupService {

    private final TripRepository tripRepository;
    private final TripPhotoRepository tripPhotoRepository;
    private final TripExpenseRepository tripExpenseRepository;
    private final UserRepository userRepository;

    public TripGroupService(
            TripRepository tripRepository,
            TripPhotoRepository tripPhotoRepository,
            TripExpenseRepository tripExpenseRepository,
            UserRepository userRepository) {
        this.tripRepository = tripRepository;
        this.tripPhotoRepository = tripPhotoRepository;
        this.tripExpenseRepository = tripExpenseRepository;
        this.userRepository = userRepository;
    }

    private Trip getTripAndCheckAccess(Long tripId, User user) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found"));
        
        boolean isCreator = trip.getCreatedBy().getId().equals(user.getId());
        boolean isMember = trip.getMembers().stream().anyMatch(m -> m.getId().equals(user.getId()));
        
        if (!isCreator && !isMember) {
            throw new IllegalArgumentException("You do not have access to this trip");
        }
        return trip;
    }

    @Transactional
    public void inviteMember(Long tripId, String email, User currentUser) {
        Trip trip = getTripAndCheckAccess(tripId, currentUser);
        
        User invitee = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User with email " + email + " not found"));
        
        if (trip.getCreatedBy().getId().equals(invitee.getId())) {
            throw new IllegalArgumentException("User is already the creator of this trip");
        }
        
        trip.getMembers().add(invitee);
        tripRepository.save(trip);
    }

    @Transactional(readOnly = true)
    public Set<User> getMembers(Long tripId, User currentUser) {
        Trip trip = getTripAndCheckAccess(tripId, currentUser);
        Set<User> allMembers = new HashSet<>();
        allMembers.add(trip.getCreatedBy());
        allMembers.addAll(trip.getMembers());
        return allMembers;
    }

    @Transactional
    public TripPhoto uploadPhoto(Long tripId, TripPhotoCreateRequest req, User currentUser) {
        Trip trip = getTripAndCheckAccess(tripId, currentUser);
        
        TripPhoto photo = TripPhoto.builder()
                .trip(trip)
                .uploadedBy(currentUser)
                .imageUrl(req.getImageUrl())
                .caption(req.getCaption())
                .dayNumber(req.getDayNumber())
                .activityName(req.getActivityName())
                .build();
                
        return tripPhotoRepository.save(photo);
    }

    @Transactional(readOnly = true)
    public List<TripPhoto> getPhotos(Long tripId, User currentUser) {
        getTripAndCheckAccess(tripId, currentUser);
        return tripPhotoRepository.findByTripIdOrderByCreatedAtDesc(tripId);
    }

    @Transactional
    public TripExpense addExpense(Long tripId, TripExpenseCreateRequest req, User currentUser) {
        Trip trip = getTripAndCheckAccess(tripId, currentUser);
        
        TripExpense expense = TripExpense.builder()
                .trip(trip)
                .paidBy(currentUser)
                .amount(req.getAmount())
                .description(req.getDescription())
                .build();
                
        return tripExpenseRepository.save(expense);
    }

    @Transactional(readOnly = true)
    public List<TripExpense> getExpenses(Long tripId, User currentUser) {
        getTripAndCheckAccess(tripId, currentUser);
        return tripExpenseRepository.findByTripIdOrderByCreatedAtDesc(tripId);
    }

    @Transactional(readOnly = true)
    public List<ExpenseSplitResponse> calculateSplits(Long tripId, User currentUser) {
        Trip trip = getTripAndCheckAccess(tripId, currentUser);
        
        List<TripExpense> expenses = tripExpenseRepository.findByTripIdOrderByCreatedAtDesc(tripId);
        Set<User> participants = getMembers(tripId, currentUser);
        
        int n = participants.size();
        if (n <= 1) {
            return new ArrayList<>();
        }

        BigDecimal total = expenses.stream()
                .map(TripExpense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
        BigDecimal share = total.divide(BigDecimal.valueOf(n), 4, RoundingMode.HALF_UP);
        
        Map<User, BigDecimal> paidMap = new HashMap<>();
        for (User u : participants) {
            paidMap.put(u, BigDecimal.ZERO);
        }
        
        for (TripExpense exp : expenses) {
            User payer = exp.getPaidBy();
            paidMap.put(payer, paidMap.getOrDefault(payer, BigDecimal.ZERO).add(exp.getAmount()));
        }
        
        List<UserBalance> balances = new ArrayList<>();
        for (User u : participants) {
            BigDecimal balance = paidMap.get(u).subtract(share);
            balances.add(new UserBalance(u, balance.doubleValue()));
        }
        
        List<UserBalance> creditors = balances.stream()
                .filter(b -> b.balance > 0.01)
                .sorted(Comparator.comparingDouble((UserBalance b) -> b.balance).reversed())
                .collect(Collectors.toList());
                
        List<UserBalance> debtors = balances.stream()
                .filter(b -> b.balance < -0.01)
                .sorted(Comparator.comparingDouble(b -> b.balance))
                .collect(Collectors.toList());
                
        List<ExpenseSplitResponse> splits = new ArrayList<>();
        int creditorIdx = 0;
        int debtorIdx = 0;
        
        while (creditorIdx < creditors.size() && debtorIdx < debtors.size()) {
            UserBalance c = creditors.get(creditorIdx);
            UserBalance d = debtors.get(debtorIdx);
            
            double toPay = Math.min(c.balance, -d.balance);
            if (toPay > 0.01) {
                splits.add(ExpenseSplitResponse.builder()
                        .fromUserName(d.user.getFullName())
                        .fromUserEmail(d.user.getEmail())
                        .toUserName(c.user.getFullName())
                        .toUserEmail(c.user.getEmail())
                        .amount(BigDecimal.valueOf(toPay).setScale(2, RoundingMode.HALF_UP))
                        .build());
            }
            
            c.balance -= toPay;
            d.balance += toPay;
            
            if (c.balance < 0.01) {
                creditorIdx++;
            }
            if (-d.balance < 0.01) {
                debtorIdx++;
            }
        }
        
        return splits;
    }
    
    private static class UserBalance {
        final User user;
        double balance;
        
        UserBalance(User user, double balance) {
            this.user = user;
            this.balance = balance;
        }
    }
}
