package com.nexboard.nexboard;

import com.nexboard.nexboard.entity.Department;
import com.nexboard.nexboard.entity.Employee;
import com.nexboard.nexboard.enums.EmployeeStatus;
import com.nexboard.nexboard.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration test verifying Employee Search, Pagination, Sorting, and Global Exception Handler.
 * Sets up MockMvc manually to avoid classpath issues with spring-boot-test-autoconfigure.
 */
@SpringBootTest
@Transactional
public class EmployeeSearchControllerTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    private MockMvc mockMvc;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private WorkflowTemplateRepository workflowTemplateRepository;

    @Autowired
    private WorkflowStageRepository workflowStageRepository;

    @Autowired
    private WorkflowTaskRepository workflowTaskRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private EmployeeDocumentRepository employeeDocumentRepository;

    @Autowired
    private ApprovalRequestRepository approvalRequestRepository;

    @Autowired
    private ApprovalHistoryRepository approvalHistoryRepository;

    @Autowired
    private EscalationRepository escalationRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    private Employee manager;
    private Employee emp1;
    private Employee emp2;
    private Department deptIT;
    private Department deptHR;

    @BeforeEach
    public void setup() {
        // Build MockMvc manually with Security support
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();

        // Clean up database records in order of dependency to prevent foreign key violations
        notificationRepository.deleteAll();
        workflowTaskRepository.deleteAll();
        workflowStageRepository.deleteAll();
        workflowTemplateRepository.deleteAll();
        employeeDocumentRepository.deleteAll();
        approvalHistoryRepository.deleteAll();
        approvalRequestRepository.deleteAll();
        escalationRepository.deleteAll();
        auditLogRepository.deleteAll();

        // Break self-referential loops in employee-manager hierarchy
        for (Employee e : employeeRepository.findAll()) {
            e.setManager(null);
            employeeRepository.save(e);
        }
        
        employeeRepository.deleteAll();
        departmentRepository.deleteAll();

        // Seed departments
        deptIT = new Department();
        deptIT.setName("Information Technology");
        deptIT = departmentRepository.save(deptIT);

        deptHR = new Department();
        deptHR.setName("Human Resources");
        deptHR = departmentRepository.save(deptHR);

        // Seed manager
        manager = new Employee();
        manager.setFirstName("Alice");
        manager.setLastName("Smith");
        manager.setEmail("alice.smith@example.com");
        manager.setDepartment(deptIT);
        manager.setJoiningDate(LocalDate.of(2025, 1, 10));
        manager.setStatus(EmployeeStatus.ACTIVE);
        manager.setCreatedAt(LocalDateTime.now());
        manager = employeeRepository.save(manager);

        // Seed sub-employees
        emp1 = new Employee();
        emp1.setFirstName("John");
        emp1.setLastName("Doe");
        emp1.setEmail("john.doe@example.com");
        emp1.setDepartment(deptIT);
        emp1.setJoiningDate(LocalDate.of(2026, 6, 20));
        emp1.setStatus(EmployeeStatus.ACTIVE);
        emp1.setManager(manager);
        emp1.setCreatedAt(LocalDateTime.now());
        emp1 = employeeRepository.save(emp1);

        emp2 = new Employee();
        emp2.setFirstName("Jane");
        emp2.setLastName("Miller");
        emp2.setEmail("jane.miller@example.com");
        emp2.setDepartment(deptHR);
        emp2.setJoiningDate(LocalDate.of(2026, 6, 25));
        emp2.setStatus(EmployeeStatus.ONBOARDING);
        emp2.setCreatedAt(LocalDateTime.now());
        emp2 = employeeRepository.save(emp2);
    }

    @Test
    @WithMockUser(roles = "HR")
    public void testSearchByName() throws Exception {
        mockMvc.perform(get("/employees/search")
                        .param("name", "John")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].firstName", is("John")));
    }

    @Test
    @WithMockUser(roles = "HR")
    public void testSearchByDepartment() throws Exception {
        mockMvc.perform(get("/employees/search")
                        .param("department", "Human Resources")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].firstName", is("Jane")));
    }

    @Test
    @WithMockUser(roles = "HR")
    public void testSearchByStatus() throws Exception {
        mockMvc.perform(get("/employees/search")
                        .param("status", "ONBOARDING")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].firstName", is("Jane")));
    }

    @Test
    @WithMockUser(roles = "HR")
    public void testSearchByJoiningDate() throws Exception {
        mockMvc.perform(get("/employees/search")
                        .param("joiningDate", "2026-06-25")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].firstName", is("Jane")));
    }

    @Test
    @WithMockUser(roles = "HR")
    public void testSearchByManagerName() throws Exception {
        mockMvc.perform(get("/employees/search")
                        .param("managerName", "Alice")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].firstName", is("John")));
    }

    @Test
    @WithMockUser(roles = "HR")
    public void testSearchByManagerId() throws Exception {
        mockMvc.perform(get("/employees/search")
                        .param("managerId", manager.getId().toString())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].firstName", is("John")));
    }

    @Test
    @WithMockUser(roles = "HR")
    public void testPaginationAndSorting() throws Exception {
        mockMvc.perform(get("/employees/search")
                        .param("page", "0")
                        .param("size", "1")
                        .param("sortBy", "firstName")
                        .param("sortDir", "asc")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].firstName", is("Alice"))) // Alice < Jane < John
                .andExpect(jsonPath("$.totalPages", is(3)))
                .andExpect(jsonPath("$.totalElements", is(3)));
    }

    @Test
    @WithMockUser(roles = "HR")
    public void testEmployeeNotFoundException() throws Exception {
        mockMvc.perform(get("/employees/99999")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message", containsString("Employee not found with id : 99999")))
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.error", is("Not Found")))
                .andExpect(jsonPath("$.path", is("/employees/99999")));
    }

    @Test
    @WithMockUser(roles = "HR")
    public void testValidationException() throws Exception {
        String invalidEmployeeJson = "{\"firstName\":\"\",\"lastName\":\"\",\"email\":\"invalid-email\",\"departmentId\":" + deptIT.getId() + "}";

        mockMvc.perform(post("/employees")
                        .content(invalidEmployeeJson)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.error", is("Bad Request")))
                .andExpect(jsonPath("$.details", hasSize(greaterThanOrEqualTo(1))));
    }
}
