package com.nexboard.nexboard.repository;

import com.nexboard.nexboard.entity.Employee;
import com.nexboard.nexboard.enums.EmployeeStatus;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

/**
 * Helper class containing JPA Specifications for dynamic filtering of Employee entities.
 */
public class EmployeeSpecification {

    /**
     * Filter employees whose first or last name contains the search string.
     */
    public static Specification<Employee> hasName(String name) {
        return (root, query, cb) -> {
            if (name == null || name.trim().isEmpty()) {
                return null;
            }
            String pattern = "%" + name.trim().toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("firstName")), pattern),
                    cb.like(cb.lower(root.get("lastName")), pattern)
            );
        };
    }

    /**
     * Filter employees by department name (partial, case-insensitive) or department ID.
     */
    public static Specification<Employee> hasDepartment(String department) {
        return (root, query, cb) -> {
            if (department == null || department.trim().isEmpty()) {
                return null;
            }
            String value = department.trim();
            try {
                // If numeric, search by department ID
                Long deptId = Long.parseLong(value);
                return cb.equal(root.get("department").get("id"), deptId);
            } catch (NumberFormatException e) {
                // Otherwise, search by department name (case-insensitive partial match)
                String pattern = "%" + value.toLowerCase() + "%";
                return cb.like(cb.lower(root.join("department").get("name")), pattern);
            }
        };
    }

    /**
     * Filter employees who joined on a specific date.
     */
    public static Specification<Employee> hasJoiningDate(LocalDate joiningDate) {
        return (root, query, cb) -> {
            if (joiningDate == null) {
                return null;
            }
            return cb.equal(root.get("joiningDate"), joiningDate);
        };
    }

    /**
     * Filter employees by their current lifecycle status.
     */
    public static Specification<Employee> hasStatus(EmployeeStatus status) {
        return (root, query, cb) -> {
            if (status == null) {
                return null;
            }
            return cb.equal(root.get("status"), status);
        };
    }

    /**
     * Filter employees by manager name or manager ID.
     */
    public static Specification<Employee> hasManager(String managerName, Long managerId) {
        return (root, query, cb) -> {
            if (managerId != null) {
                return cb.equal(root.get("manager").get("id"), managerId);
            }
            if (managerName == null || managerName.trim().isEmpty()) {
                return null;
            }
            String pattern = "%" + managerName.trim().toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.join("manager", JoinType.LEFT).get("firstName")), pattern),
                    cb.like(cb.lower(root.join("manager", JoinType.LEFT).get("lastName")), pattern)
            );
        };
    }
}
