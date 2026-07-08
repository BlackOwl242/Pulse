# TÀI LIỆU KIẾN TRÚC & CƠ SỞ DỮ LIỆU DỰ ÁN PULSE
*Hệ thống Quản lý Dự án & Cộng tác Doanh nghiệp (Enterprise Project Management & Collaboration Platform)*

---

## 1. TỔNG QUAN HỆ THỐNG & NHIỆM VỤ CÁC THÀNH PHẦN (STRUCTURE & FILES)

Dự án **Pulse** là một ứng dụng web dạng Monolith ở phía Backend và Single Page Application ở phía Frontend, được tổ chức thành hai thư mục chính:
*   `Pulse_be`: Cung cấp RESTful API và các kết nối Real-time Hubs thông qua ASP.NET Core và EF Core.
*   `Pulse_fe`: Giao diện người dùng xây dựng trên Next.js (App Router), Zustand (quản lý trạng thái) và Tailwind CSS/Vanilla CSS.

---

### A. Backend (`Pulse_be`)
Nằm trong thư mục `src/Pulse.API`, backend sử dụng kiến trúc phân lớp cơ bản (Controllers - Services - Models/Data) kết hợp với các middleware và cơ chế phân quyền nâng cao.

*   `Program.cs`: Điểm khởi chạy của hệ thống. Đảm nhận việc đăng ký cấu hình Serilog, Entity Framework Core (PostgreSQL), cài đặt chế độ xác thực kép (Custom JWT + Keycloak OAuth2 cho Google), khai báo Dependency Injection (DI) cho Services, cấu hình CORS, khởi tạo các SignalR Hubs và thực thi Auto-migration/Seeder khi chạy môi trường Development.
*   `appsettings.Development.json` & `appsettings.json`: Lưu trữ thông tin kết nối cơ sở dữ liệu (`ConnectionStrings`), cấu hình máy chủ gửi email (`EmailConfiguration`), khóa ký JWT (`Jwt`), thông số SSO Keycloak (`Keycloak`), danh sách origin được phép kết nối (`Cors`) và đường dẫn API dịch vụ MCP PicoClaw (`PicoClaw`).
*   `Data/`:
    *   [ApplicationDbContext.cs](file:///c:/Users/legen/Documents/GitHub/Pulse/Pulse_be/src/Pulse.API/Data/ApplicationDbContext.cs): Context quản lý EF Core chứa 45 thực thể bảng, định nghĩa các khóa ngoại (Foreign Keys), thiết lập query filter phục vụ cơ chế Soft Delete (`IsDeleted`), và cấu hình dữ liệu mặc định (Seed Data) cho Roles/Permissions.
    *   `DbSeeder.cs`: Hỗ trợ sinh dữ liệu mẫu (Sample Data) phong phú (Workspaces, Projects, Tasks, Chats, OKRs) giúp môi trường Development dễ dàng chạy thử.
*   `Controllers/`: Tiếp nhận HTTP Request và điều phối phản hồi JSON:
    *   `AuthController.cs`: Đăng nhập, đăng ký, xác thực hai bước (2FA), cấp lại token (`refresh-token`), thu hồi token.
    *   `WorkspacesController.cs`: Quản lý không gian làm việc (Workspaces), thành viên, và cổng tìm kiếm toàn cầu.
    *   `TasksController.cs`, `ProjectsController.cs`, `ChecklistsController.cs`, `CommentsController.cs`, `LabelsController.cs`, `TaskDependenciesController.cs`: Bộ điều khiển luồng công việc của phân hệ Task Management.
    *   `ChatController.cs`: Quản lý các kênh chat (`ChatChannel`), lưu lịch sử chat, tin nhắn tự hủy, và tập tin đính kèm.
    *   `PlannerController.cs`, `CalendarController.cs`, `MeetingsController.cs`: Quản lý thời gian biểu cá nhân, sự kiện lịch, và lịch họp.
    *   `OKRController.cs`: Theo dõi các mục tiêu (`Objectives`) và kết quả then chốt (`Key Results`).
    *   `AIAssistantController.cs`: Tương tác với AI Chatbot thông qua PicoClaw MCP Server.
    *   `AnalyticsController.cs`, `TimeTrackingController.cs`: Xử lý bảng điều khiển (Dashboard Widgets), bấm giờ công việc (`Time Entries`), báo cáo tiến độ và hiệu suất công việc.
*   `Services/`: Lớp chứa logic xử lý nghiệp vụ chính:
    *   `AuthService.cs` & `JwtTokenService.cs`: Logic xác thực tài khoản, kiểm tra thông tin và mã hóa tạo token JWT.
    *   `PicoClawService.cs` & `AIActionExecutor.cs`: Dịch vụ gửi yêu cầu phân tích dữ liệu, tự động kích hoạt hành động công việc bằng AI.
    *   `NotificationService.cs`: Xử lý lưu thông báo vào database và đồng thời phát thông báo Real-time đến thiết bị người dùng.
    *   `EmailService.cs`: Dịch vụ gửi email thông báo, thư mời tham gia workspace, hoặc lấy lại mật khẩu.
    *   `MessageCleanupService.cs`: Background Service định kỳ dọn dẹp các tin nhắn có chế độ tự hủy (`Self-destruct`) trong phòng chat.
*   `Authorization/`:
    *   [RequirePermissionAttribute.cs](file:///c:/Users/legen/Documents/GitHub/Pulse/Pulse_be/src/Pulse.API/Authorization/RequirePermissionAttribute.cs): Annotation kiểm tra quyền hạn của người dùng đối với hành động hiện tại dựa trên bảng liên kết quyền trong Workspace.
    *   [RequireWorkspaceMemberAttribute.cs](file:///c:/Users/legen/Documents/GitHub/Pulse/Pulse_be/src/Pulse.API/Authorization/RequireWorkspaceMemberAttribute.cs): Đảm bảo người dùng gửi request phải thuộc về Workspace dựa trên slug định dạng trong URL.
*   `Hubs/`: Các SignalR Hubs phụ trách kết nối song công thời gian thực:
    *   `ChatHub.cs`: Truyền phát tin nhắn chat, hiển thị trạng thái đang nhập chữ (Typing) và trạng thái đã đọc (Read receipts).
    *   `NotificationHub.cs`: Phát tín hiệu thông báo mới tới client.
    *   `WhiteboardHub.cs`: Đồng bộ hóa tọa độ vẽ nét của bảng trắng tương tác (Whiteboard) giữa nhiều người dùng cùng lúc.
*   `Middleware/`:
    *   `ExceptionHandlingMiddleware.cs`: Bắt tất cả các lỗi xảy ra trong quá trình xử lý API, ghi log và chuẩn hóa phản hồi lỗi về dạng JSON đồng nhất.

---

### B. Frontend (`Pulse_fe`)
Được thiết kế dựa trên Next.js App Router, giúp ứng dụng chuyển đổi mượt mà giữa các trang mà không cần tải lại toàn bộ trang web.

*   `src/app/`: Định nghĩa định tuyến (Routing) cho ứng dụng:
    *   `(auth)`: Các trang xác thực ngoài hệ thống như Đăng nhập (`signin`), Đăng ký (`signup`), Quên mật khẩu, Xác thực 2 bước.
    *   `(admin)`: Các trang chức năng chính sau khi đăng nhập được nhóm chung vào một layout có sidebar điều hướng và topbar.
        *   `projects/`, `projects/[projectId]/`: Giao diện hiển thị danh sách dự án và chi tiết dự án (Kanban, List view, dòng thời gian).
        *   `chat/`: Giao diện chat thời gian thực (Channels & Direct Messages).
        *   `calendar/` & `planner/`: Giao diện quản lý thời gian biểu và lịch biểu.
        *   `whiteboards/`: Giao diện bảng vẽ tldraw.
        *   `objectives/` (OKR): Giao diện quản lý mục tiêu và cập nhật tiến độ Key Results.
        *   `settings/`: Giao diện quản lý phân quyền thành viên, phân vai trò, xem lịch sử hoạt động (Audit log) của hệ thống.
*   `src/services/`: Lớp kết nối HTTP Client:
    *   [api.ts](file:///c:/Users/legen/Documents/GitHub/Pulse/Pulse_fe/src/services/api.ts): Cấu hình Axios Client gửi kèm Credentials (Cookies chứa refresh token) và tự động gắn Token JWT từ Zustand store vào tiêu đề `Authorization: Bearer <token>`. Đồng thời xử lý tự động làm mới mã access token (Silent Refresh Token) qua response interceptor khi nhận mã lỗi `401 Unauthorized`.
*   `src/stores/`: Chứa các Zustand Store quản lý trạng thái chia sẻ trong ứng dụng:
    *   `useAuthStore.ts`: Lưu thông tin tài khoản đang đăng nhập và Access Token.
    *   `useWorkspaceStore.ts`: Lưu thông tin Workspace hiện tại mà người dùng đang truy cập.
    *   `useTaskStore.ts`: Quản lý danh sách tác vụ đang hiển thị và bộ lọc tìm kiếm.
    *   `useNotificationStore.ts`: Đồng bộ hóa trạng thái thông báo đẩy thời gian thực từ SignalR.

---

## 2. KẾT NỐI CƠ SỞ DỮ LIỆU (DATABASE CONNECTION)

Pulse sử dụng hệ quản trị cơ sở dữ liệu **PostgreSQL** kết hợp với **Entity Framework Core (Npgsql)** làm công cụ ORM.

1.  **Cấu hình kết nối**:
    Chuỗi kết nối được khai báo trong tệp `appsettings.Development.json` tại khóa `ConnectionStrings.DefaultConnection`:
    ```json
    "ConnectionStrings": {
      "DefaultConnection": "Host=localhost;Port=5433;Database=pulse_db;Username=pulse_admin;Password=pulse_password"
    }
    ```
2.  **Khởi tạo kết nối trong Program.cs**:
    Đăng ký DbContext vào thùng chứa Dependency Injection của ASP.NET Core:
    ```csharp
    Npgsql.NpgsqlConnection.GlobalTypeMapper.EnableDynamicJson(); // Hỗ trợ lưu trữ kiểu dữ liệu JSONB trong Postgres

    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
    ```
3.  **Cập nhật cơ sở dữ liệu khi khởi chạy**:
    Khi hệ thống chạy ở môi trường Development, backend tự động quét qua các Migration cũ và áp dụng các bảng mới vào PostgreSQL, sau đó chạy Seeder để điền dữ liệu mẫu:
    ```csharp
    if (app.Environment.IsDevelopment())
    {
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        db.Database.Migrate(); // Tự động cập nhật bảng
        await DbSeeder.SeedSampleDataAsync(db); // Seed dữ liệu
    }
    ```
4.  **Khôi phục cơ sở dữ liệu qua Docker (Database Backup & Restore)**:
    Dự án đã được cấu hình sẵn tệp sao lưu (backup) cơ sở dữ liệu bằng EF Core Migrations tại `Pulse_be/database/init.sql`. Khi bạn tải dự án về (pull), chỉ cần khởi chạy Docker Compose, hệ thống sẽ tự động khôi phục cấu trúc bảng từ tệp này mà không cần cấu hình thêm:
    ```bash
    cd Pulse_be
    docker-compose up -d
    ```
    *Lưu ý: Nếu bạn đã từng chạy database trước đó và muốn khôi phục lại (chạy lại file init.sql), bạn cần xóa volume dữ liệu cũ bằng lệnh `docker-compose down -v` rồi chạy lại lệnh `docker-compose up -d`.*

---

## 3. CƠ CHẾ TRUY XUẤT, TÌM KIẾM VÀ HIỂN THỊ DỮ LIỆU (RETRIEVAL, SEARCH & DISPLAY)

Luồng hoạt động từ thao tác của người dùng đến cơ sở dữ liệu diễn ra như sau:

### A. Truy xuất dữ liệu (Data Retrieval)
1.  **Client-side**: Khi người dùng mở trang danh sách công việc (ví dụ: `projects/[projectId]/tasks/page.tsx`), component gửi yêu cầu qua Axios thông qua `taskService.getTasks(projectId)`.
2.  **Backend-side**: `TasksController` tiếp nhận request. Nó sử dụng LINQ để truy vấn `ApplicationDbContext.Tasks`. Để tối ưu hóa hiệu năng và tránh hiện tượng truy vấn dư thừa, dữ liệu được tải đi kèm bằng `.Include(...)` (e.g. Include Assignees, Labels) và chọn lọc qua các đối tượng DTO hoặc cấu trúc Anonymous object trước khi trả về.
3.  **Display**: Trạng thái được cập nhật vào Zustand Store (`useTaskStore`), sau đó React tiến hành render lại component danh sách để vẽ giao diện (Dạng bảng `DataTable` hoặc dạng cột thẻ Kanban kéo thả).

### B. Cơ chế Tìm kiếm (Search Mechanism)
Hệ thống sử dụng cơ chế tìm kiếm ký tự gần đúng (ILike) trực tiếp trên cơ sở dữ liệu thông qua EF Core:
1.  **Tìm kiếm tác vụ (Tasks)**:
    Khi người dùng gõ vào ô tìm kiếm, API gửi request đến `GET /api/tasks?search={keyword}`. Backend xử lý:
    ```csharp
    if (!string.IsNullOrWhiteSpace(search))
    {
        query = query.Where(t => EF.Functions.ILike(t.Title, $"%{search}%"));
    }
    ```
    Hàm `EF.Functions.ILike` sẽ tạo ra câu lệnh SQL `ILIKE` trong PostgreSQL, giúp tìm kiếm không phân biệt chữ hoa chữ thường.
2.  **Tìm kiếm toàn cầu trong Workspace (Global Search)**:
    Trang bị một ô tìm kiếm toàn cầu trên AppHeader (`GlobalSearch.tsx`). Khi người dùng gõ chữ, hàm debounce trì hoãn gửi request 300ms rồi gọi đến API `GET /api/workspaces/{slug}/search?q={keyword}`. Backend sẽ song song tìm kiếm trên cả hai bảng `Tasks` và `Projects`:
    ```csharp
    var tasks = await _db.Tasks
        .Where(t => t.Project.WorkspaceId == workspace.Id && !t.IsDeleted &&
            (EF.Functions.ILike(t.Title, $"%{q}%") || EF.Functions.ILike(t.Description ?? "", $"%{q}%")))
        .OrderByDescending(t => t.CreatedAt)
        .Take(limit)
        .Select(t => new { t.Id, t.Title, t.Status, t.Priority, ProjectName = t.Project.Name })
        .ToListAsync();
    ```

### C. Cơ chế hiển thị Real-time (Real-time Display)
Đối với các chức năng yêu cầu cập nhật liên tục mà không cần F5 trang:
*   **Trò chuyện (Chat)** & **Bảng trắng (Whiteboard)**: Phía frontend khởi tạo kết nối SignalR Hub tới đường dẫn `/hubs/chat` hoặc `/hubs/whiteboard`. Khi một người dùng gửi tin nhắn hoặc vẽ một nét vẽ, Backend sẽ broadcast (phát sóng) gói tin đến tất cả các thành viên khác đang kết nối trong phòng chat/bảng vẽ đó để cập nhật giao diện ngay lập tức.
*   **Thông báo (Notifications)**: Kết nối `/hubs/notifications` giúp đẩy thông tin thông báo In-app tức thời khi có ai đó nhắc tên (@mention), giao việc hoặc cập nhật trạng thái dự án.

---

## 4. CHI TIẾT 46 BẢNG CƠ SỞ DỮ LIỆU (DATABASE TABLES SCHEMA)

Dưới đây là sơ đồ chi tiết toàn bộ 46 bảng trong cơ sở dữ liệu PostgreSQL của hệ thống Pulse. Tất cả các bảng nghiệp vụ chính đều thừa hưởng từ `BaseEntity` (có cột `Id` khóa chính kiểu Guid, `CreatedAt` và `UpdatedAt`) hoặc `AuditableEntity` (thêm thông tin người tạo/người cập nhật `CreatedById`, `UpdatedById`).

---

### PHÂN HỆ 1: IDENTITY (Xác thực & Ủy quyền)

#### 1. Bảng `Users`
Lưu trữ thông tin tài khoản người dùng hệ thống.
*   **Khóa chính (PK)**: `Id` (Guid)
*   **Chỉ mục (Index)**: `Email` (Unique)
*   **Các cột chính**:
    *   `Email` (varchar(256), Not Null): Địa chỉ email.
    *   `PasswordHash` (text, Nullable): Mật khẩu đã mã hóa (null nếu đăng nhập qua SSO).
    *   `FirstName` (varchar(100), Not Null): Tên.
    *   `LastName` (varchar(100), Not Null): Họ.
    *   `AvatarUrl` (text, Nullable): Đường dẫn ảnh đại diện.
    *   `Provider` (integer, Not Null): Phương thức đăng nhập (0: Local, 1: Google, 2: Keycloak).
    *   `ProviderId` (text, Nullable): ID định danh từ nhà cung cấp SSO.
    *   `EmailConfirmed` (boolean, Not Null): Trạng thái xác minh email.
    *   `LastLoginAt` (timestamp, Nullable): Lần đăng nhập cuối.
    *   `IsActive` (boolean, Not Null): Trạng thái tài khoản hoạt động.

#### 2. Bảng `Roles`
Lưu trữ các vai trò (chức vụ) trong hệ thống hoặc tùy chỉnh trong từng không gian làm việc.
*   **Khóa chính (PK)**: `Id` (Guid)
*   **Chỉ mục (Index)**: `Name` (Unique)
*   **Khóa ngoại (FK)**: `WorkspaceId` -> `Workspaces(Id)` (Nullable - null nếu là vai trò hệ thống).
*   **Các cột chính**:
    *   `Name` (varchar(50), Not Null): Tên vai trò (Admin, Manager, Staff, Guest...).
    *   `Description` (text, Nullable): Mô tả vai trò.
    *   `IsSystem` (boolean, Not Null): Quyết định xem đây có phải vai trò hệ thống mặc định (không được xóa) hay không.

#### 3. Bảng `Permissions`
Chứa danh sách quyền thao tác chi tiết trong hệ thống.
*   **Khóa chính (PK)**: `Id` (Guid)
*   **Các cột chính**:
    *   `Module` (text, Not Null): Phân hệ chức năng (workspace, project, task, team, role...).
    *   `Action` (text, Not Null): Hành động (create, view, edit, delete, assign...).
    *   `Resource` (text, Not Null): Tài nguyên tác động.
    *   `Description` (text, Nullable): Mô tả quyền.

#### 4. Bảng `RolePermissions`
Bảng trung gian thiết lập mối quan hệ nhiều - nhiều giữa Vai trò (`Roles`) và Quyền (`Permissions`).
*   **Khóa chính liên hợp (Composite PK)**: (`RoleId`, `PermissionId`)
*   **Khóa ngoại (FK)**:
    *   `RoleId` -> `Roles(Id)` (Cascade Delete)
    *   `PermissionId` -> `Permissions(Id)` (Cascade Delete)

#### 5. Bảng `UserWorkspaceRoles`
Gắn kết người dùng với một không gian làm việc cụ thể và phân vai trò tương ứng của họ trong không gian đó.
*   **Khóa chính (PK)**: `Id` (Guid)
*   **Chỉ mục (Index)**: (`UserId`, `WorkspaceId`, `RoleId`) (Unique)
*   **Khóa ngoại (FK)**:
    *   `UserId` -> `Users(Id)`
    *   `WorkspaceId` -> `Workspaces(Id)`
    *   `RoleId` -> `Roles(Id)`
*   **Các cột chính**:
    *   `AssignedAt` (timestamp, Not Null): Thời gian bổ nhiệm vai trò.

#### 6. Bảng `RefreshTokens`
Quản lý mã làm mới phiên đăng nhập nhằm duy trì trạng thái đăng nhập an toàn.
*   **Khóa chính (PK)**: `Id` (Guid)
*   **Chỉ mục (Index)**: `Token` (Unique)
*   **Khóa ngoại (FK)**: `UserId` -> `Users(Id)`
*   **Các cột chính**:
    *   `Token` (text, Not Null): Mã JWT Refresh Token.
    *   `ExpiresAt` (timestamp, Not Null): Thời điểm hết hạn.
    *   `CreatedByIp` (text, Nullable): IP tạo token.
    *   `RevokedAt` (timestamp, Nullable): Thời điểm thu hồi token.
    *   `RevokedByIp` (text, Nullable): IP thực hiện thu hồi.
    *   `ReplacedByToken` (text, Nullable): Token thay thế mới.

#### 7. Bảng `PasswordResetTokens`
Lưu trữ mã xác nhận đặt lại mật khẩu của người dùng khi yêu cầu lấy lại mật khẩu.
*   **Khóa chính (PK)**: `Id` (Guid)
*   **Chỉ mục (Index)**: `Token` (Unique)
*   **Khóa ngoại (FK)**: `UserId` -> `Users(Id)`
*   **Các cột chính**:
    *   `Token` (text, Not Null): Mã khôi phục mật khẩu ngẫu nhiên.
    *   `ExpiresAt` (timestamp, Not Null): Hạn sử dụng mã.
    *   `IsUsed` (boolean, Not Null): Đã sử dụng hay chưa.

---

### PHÂN HỆ 2: ORGANIZATION (Không gian làm việc & Đội nhóm)

#### 8. Bảng `Workspaces`
Quản lý các không gian làm việc của doanh nghiệp hoặc đội nhóm.
*   **Khóa chính (PK)**: `Id` (Guid)
*   **Chỉ mục (Index)**: `Slug` (Unique)
*   **Khóa ngoại (FK)**: `OwnerId` -> `Users(Id)`
*   **Các cột chính**:
    *   `Name` (varchar(200), Not Null): Tên không gian làm việc.
    *   `Slug` (varchar(100), Not Null): Đường dẫn tĩnh URL viết liền không dấu.
    *   `LogoUrl` (text, Nullable): Ảnh logo đại diện cho Workspace.
    *   `Description` (text, Nullable): Mô tả ngắn.
    *   `Plan` (integer, Not Null): Gói dịch vụ (0: Free, 1: Pro, 2: Enterprise).
    *   `IsDeleted` (boolean, Not Null): Đánh dấu xóa mềm.
    *   `DeletedAt` (timestamp, Nullable): Ngày giờ xóa mềm.

#### 9. Bảng `Teams`
Quản lý các phòng ban hoặc đội nhóm bên trong một Workspace.
*   **Khóa chính (PK)**: `Id` (Guid)
*   **Khóa ngoại (FK)**: `WorkspaceId` -> `Workspaces(Id)`
*   **Các cột chính**:
    *   `Name` (varchar(100), Not Null): Tên phòng/đội nhóm (e.g., Marketing, Dev Backend).
    *   `Description` (text, Nullable): Mô tả chức năng đội nhóm.
    *   `Color` (text, Nullable): Mã màu hex đại diện cho đội nhóm.

#### 10. Bảng `TeamMembers`
Bảng trung gian thể hiện các thành viên thuộc về một đội nhóm (`Teams`).
*   **Khóa chính (PK)**: `Id` (Guid)
*   **Chỉ mục (Index)**: (`TeamId`, `UserId`) (Unique)
*   **Khóa ngoại (FK)**:
    *   `TeamId` -> `Teams(Id)`
    *   `UserId` -> `Users(Id)`
*   **Các cột chính**:
    *   `Role` (text, Not Null): Vai trò trong nhóm (member hoặc lead).
    *   `JoinedAt` (timestamp, Not Null): Ngày gia nhập đội.

#### 11. Bảng `UserProfiles`
Bảng thông tin cá nhân mở rộng của từng người dùng.
*   **Khóa chính (PK)**: `Id` (Guid)
*   **Chỉ mục (Index)**: `UserId` (Unique)
*   **Khóa ngoại (FK)**: `UserId` -> `Users(Id)`
*   **Các cột chính**:
    *   `JobTitle` (text, Nullable): Chức danh công việc.
    *   `Department` (text, Nullable): Phòng ban.
    *   `Phone` (text, Nullable): Số điện thoại liên hệ.
    *   `Timezone` (text, Nullable): Múi giờ sử dụng.
    *   `Bio` (text, Nullable): Giới thiệu bản thân.
    *   `Skills` (jsonb, Not Null): Lưu danh sách kỹ năng dưới dạng mảng JSON.
    *   `SocialLinks` (jsonb, Not Null): Lưu liên kết mạng xã hội dưới dạng key-value JSON.

#### 12. Bảng `Invitations`
Lưu trữ thông tin lời mời người dùng mới gia nhập vào một Workspace.
*   **Khóa chính (PK)**: `Id` (Guid)
*   **Chỉ mục (Index)**: `Token` (Unique)
*   **Khóa ngoại (FK)**:
    *   `WorkspaceId` -> `Workspaces(Id)`
    *   `RoleId` -> `Roles(Id)`
    *   `InvitedById` -> `Users(Id)`
*   **Các cột chính**:
    *   `Email` (varchar(256), Not Null): Email của người nhận lời mời.
    *   `Token` (text, Not Null): Token ngẫu nhiên đính kèm trong link gửi qua email.
    *   `Status` (integer, Not Null): Trạng thái (0: Pending, 1: Accepted, 2: Expired, 3: Revoked).
    *   `ExpiresAt` (timestamp, Not Null): Hạn chót để chấp nhận lời mời.
    *   `AcceptedAt` (timestamp, Nullable): Ngày chấp nhận tham gia.

---

### PHÂN HỆ 3: TASK MANAGEMENT (Quản lý Công việc)

#### 13. Bảng `Projects`
Quản lý các dự án trong từng không gian làm việc.
*   **Khóa chính (PK)**: `Id` (Guid)
*   **Khóa ngoại (FK)**: `WorkspaceId` -> `Workspaces(Id)`
*   **Các cột chính**:
    *   `Name` (varchar(200), Not Null): Tên dự án.
    *   `Description` (text, Nullable): Mô tả dự án.
    *   `Color` (text, Nullable): Mã màu nhận diện dự án.
    *   `Icon` (text, Nullable): Tên icon hiển thị.
    *   `Status` (integer, Not Null): Trạng thái dự án (0: Active, 1: Archived, 2: Template).
    *   `StartDate` (timestamp, Nullable): Ngày bắt đầu dự án.
    *   `EndDate` (timestamp, Nullable): Hạn chót kết thúc dự án.
    *   `IsDeleted` (boolean, Not Null): Đánh dấu xóa mềm.
    *   `DeletedAt` (timestamp, Nullable): Thời gian thực hiện xóa mềm.

#### 14. Bảng `Tasks` (Ánh xạ từ thực thể `TaskItem`)
Bảng trọng tâm lưu trữ toàn bộ các tác vụ công việc thuộc dự án.
*   **Khóa chính (PK)**: `Id` (Guid)
*   **Khóa ngoại (FK)**:
    *   `ProjectId` -> `Projects(Id)`
    *   `ParentTaskId` -> `Tasks(Id)` (Nullable - phục vụ tạo tác vụ con đa cấp).
*   **Các cột chính**:
    *   `Title` (varchar(500), Not Null): Tiêu đề tác vụ.
    *   `Description` (text, Nullable): Nội dung mô tả chi tiết yêu cầu công việc.
    *   `Status` (integer, Not Null): Trạng thái (0: Todo, 1: InProgress, 2: InReview, 3: Done, 4: Blocked).
    *   `Priority` (integer, Not Null): Độ ưu tiên (0: None, 1: Low, 2: Medium, 3: High, 4: Urgent).
    *   `Deadline` (timestamp, Nullable): Hạn chót hoàn thành.
    *   `StartDate` (timestamp, Nullable): Ngày bắt đầu làm.
    *   `Position` (integer, Not Null): Thứ tự sắp xếp hiển thị trên bảng Kanban.
    *   `EstimatedMinutes` (integer, Nullable): Thời gian ước tính hoàn thành (phút).
    *   `ActualMinutes` (integer, Nullable): Thời gian thực tế đã thực hiện (phút).
    *   `CompletedAt` (timestamp, Nullable): Thời điểm tác vụ chuyển sang trạng thái hoàn thành.
    *   `IsDeleted` (boolean, Not Null): Đánh dấu xóa mềm.
    *   `DeletedAt` (timestamp, Nullable): Thời gian thực hiện xóa mềm.

#### 15. Bảng `TaskAssignees`
Bảng trung gian thể hiện những người thực hiện công việc được giao trong tác vụ.
*   **Khóa chính liên hợp (Composite PK)**: (`TaskId`, `UserId`)
*   **Khóa ngoại (FK)**:
    *   `TaskId` -> `Tasks(Id)` (Cascade Delete)
    *   `UserId` -> `Users(Id)`
*   **Các cột chính**:
    *   `AssignedAt` (timestamp, Not Null): Thời điểm được phân công.

#### 16. Bảng `TaskFollowers`
Bảng lưu thông tin những thành viên quan tâm theo dõi diễn biến cập nhật của tác vụ.
*   **Khóa chính liên hợp (Composite PK)**: (`TaskId`, `UserId`)
*   **Khóa ngoại (FK)**:
    *   `TaskId` -> `Tasks(Id)` (Cascade Delete)
    *   `UserId` -> `Users(Id)`
*   **Các cột chính**:
    *   `FollowedAt` (timestamp, Not Null): Thời điểm bắt đầu theo dõi.

#### 17. Bảng `TaskLabels`
Lưu trữ các nhãn dán phân loại màu sắc bên trong từng dự án.
*   **Khóa chính (PK)**: `Id` (Guid)
*   **Khóa ngoại (FK)**: `ProjectId` -> `Projects(Id)`
*   **Các cột chính**:
    *   `Name` (text, Not Null): Tên nhãn (e.g., Bug, Feature).
    *   `Color` (text, Not Null): Màu nền nhãn dán (mặc định `#6366f1`).

#### 18. Bảng `TaskLabelAssignments`
Bảng trung gian gắn kết nhãn dán (`TaskLabels`) vào các tác vụ công việc (`Tasks`).
*   **Khóa chính liên hợp (Composite PK)**: (`TaskId`, `LabelId`)
*   **Khóa ngoại (FK)**:
    *   `TaskId` -> `Tasks(Id)` (Cascade Delete)
    *   `LabelId` -> `TaskLabels(Id)` (Cascade Delete)

#### 19. Bảng `TaskChecklists`
Quản lý các nhóm danh sách kiểm tra (Checklists) nhỏ nằm trong một tác vụ lớn.
*   **Khóa chính (PK)**: `Id` (Guid)
*   **Khóa ngoại (FK)**: `TaskId` -> `Tasks(Id)`
*   **Các cột chính**:
    *   `Title` (text, Not Null): Tiêu đề nhóm việc (e.g., Thiết kế giao diện).
    *   `Position` (integer, Not Null): Thứ tự hiển thị nhóm.

#### 20. Bảng `ChecklistItems`
Lưu trữ các đầu việc chi tiết trong từng checklist.
*   **Khóa chính (PK)**: `Id` (Guid)
*   **Khóa ngoại (FK)**:
    *   `ChecklistId` -> `TaskChecklists(Id)`
    *   `AssigneeId` -> `Users(Id)` (Nullable - giao đầu việc cụ thể cho một người).
*   **Các cột chính**:
    *   `Content` (text, Not Null): Nội dung đầu việc cần làm.
    *   `IsCompleted` (boolean, Not Null): Trạng thái hoàn thành đầu việc.
    *   `Position` (integer, Not Null): Vị trí sắp xếp đầu việc.
    *   `CompletedAt` (timestamp, Nullable): Ngày giờ hoàn thành việc nhỏ này.

#### 21. Bảng `TaskAttachments`
Quản lý các tài liệu, hình ảnh tải lên đính kèm trực tiếp vào từng tác vụ công việc.
*   **Khóa chính (PK)**: `Id` (Guid)
*   **Khóa ngoại (FK)**:
    *   `TaskId` -> `Tasks(Id)`
    *   `UploadedById` -> `Users(Id)`
*   **Các cột chính**:
    *   `FileName` (text, Not Null): Tên tệp gốc.
    *   `FileUrl` (text, Not Null): Đường dẫn lưu trữ tệp trên server hoặc Cloud.
    *   `FileType` (text, Nullable): Kiểu tệp đính kèm (e.g., pdf, png).
    *   `FileSize` (bigint, Not Null): Dung lượng tệp tính bằng byte.

#### 22. Bảng `TaskComments`
Bảng lưu bình luận trò chuyện trao đổi của các thành viên xoay quanh một tác vụ.
*   **Khóa chính (PK)**: `Id` (Guid)
*   **Khóa ngoại (FK)**:
    *   `TaskId` -> `Tasks(Id)`
    *   `AuthorId` -> `Users(Id)`
    *   `ParentCommentId` -> `TaskComments(Id)` (Nullable - cho phép trả lời lồng bình luận).
*   **Các cột chính**:
    *   `Content` (text, Not Null): Nội dung bình luận.

#### 23. Bảng `TaskDependencies`
Định nghĩa sự phụ thuộc ràng buộc tiến độ giữa các tác vụ (Ví dụ: Tác vụ A phải xong thì mới bắt đầu được tác vụ B).
*   **Khóa chính (PK)**: `Id` (Guid)
*   **Khóa ngoại (FK)**:
    *   `TaskId` -> `Tasks(Id)` (Restrict - Tác vụ hiện tại)
    *   `DependsOnTaskId` -> `Tasks(Id)` (Restrict - Tác vụ làm tiền đề)
*   **Các cột chính**:
    *   `Type` (integer, Not Null): Loại phụ thuộc (0: Blocks - Khóa tác vụ khác, 1: BlockedBy - Bị khóa bởi tác vụ khác, 2: RelatesTo - Liên quan).

---

### PHÂN HỆ 4: PLANNER (Thời gian biểu & Cuộc họp)

#### 24. Bảng `PlannerBlocks`
Sử dụng cho tính năng Time Blocking giúp người dùng lập kế hoạch làm việc theo giờ trong ngày.
*   **Khóa chính (PK)**: `Id` (Guid)
*   **Khóa ngoại (FK)**:
    *   `UserId` -> `Users(Id)`
    *   `TaskId` -> `Tasks(Id)` (Nullable - khối thời gian có thể liên kết tới tác vụ cụ thể hoặc không).
*   **Các cột chính**:
    *   `Title` (text, Nullable): Tên khối thời gian lập kế hoạch (nếu tự thiết lập).
    *   `StartTime` (timestamp, Not Null): Thời gian bắt đầu.
    *   `EndTime` (timestamp, Not Null): Thời gian kết thúc.
    *   `Type` (integer, Not Null): Thể loại hoạt động (0: Task, 1: Meeting, 2: Personal, 3: Focus).
    *   `RecurrencePattern` (text, Nullable): Quy luật lặp lại (nếu có).

#### 25. Bảng `CalendarEvents`
Lưu trữ các sự kiện lịch cá nhân hoặc đồng bộ từ Google Calendar.
*   **Khóa chính (PK)**: `Id` (Guid)
*   **Khóa ngoại (FK)**: `UserId` -> `Users(Id)`
*   **Các cột chính**:
    *   `WorkspaceId` (Guid, Not Null): Workspace chứa sự kiện.
    *   `GoogleEventId` (text, Nullable): ID sự kiện đồng bộ từ tài khoản Google.
    *   `Title` (text, Not Null): Tiêu đề sự kiện lịch.
    *   `Description` (text, Nullable): Chi tiết mô tả.
    *   `StartTime` (timestamp, Not Null): Giờ bắt đầu.
    *   `EndTime` (timestamp, Not Null): Giờ kết thúc.
    *   `IsAllDay` (boolean, Not Null): Sự kiện diễn ra cả ngày.
    *   `Location` (text, Nullable): Địa điểm tổ chức.
    *   `Status` (integer, Not Null): Trạng thái xác thực (0: Confirmed, 1: Tentative, 2: Cancelled).
    *   `Attendees` (jsonb, Not Null): Mảng danh sách địa chỉ email người tham dự dạng JSON.

#### 26. Bảng `Meetings`
Quản lý các cuộc họp được lên lịch thảo luận nội bộ.
*   **Khóa chính (PK)**: `Id` (Guid)
*   **Khóa ngoại (FK)**:
    *   `OrganizerId` -> `Users(Id)`
    *   `CalendarEventId` -> `CalendarEvents(Id)` (Nullable - liên kết sang sự kiện lịch biểu).
*   **Các cột chính**:
    *   `WorkspaceId` (Guid, Not Null): Workspace chứa cuộc họp.
    *   `Title` (text, Not Null): Tiêu đề cuộc họp.
    *   `Description` (text, Nullable): Nội dung tóm tắt.
    *   `Agenda` (text, Nullable): Chương trình/nội dung họp chi tiết.
    *   `ProposedStartTime` (timestamp, Not Null): Thời gian đề xuất bắt đầu.
    *   `ProposedEndTime` (timestamp, Not Null): Thời gian đề xuất kết thúc.
    *   `Status` (integer, Not Null): Trạng thái (0: Proposed, 1: Confirmed, 2: Cancelled, 3: Completed).

#### 27. Bảng `MeetingParticipants`
Quản lý thông tin và phản hồi của những người được mời tham gia cuộc họp.
*   **Khóa chính (PK)**: `Id` (Guid)
*   **Khóa ngoại (FK)**:
    *   `MeetingId` -> `Meetings(Id)`
    *   `UserId` -> `Users(Id)`
*   **Các cột chính**:
    *   `ResponseStatus` (integer, Not Null): Trạng thái phản hồi (0: Pending, 1: Accepted, 2: Declined, 3: Tentative).
    *   `RespondedAt` (timestamp, Nullable): Thời điểm gửi phản hồi.

#### 28. Bảng `Whiteboards`
Quản lý bảng vẽ cộng tác tương tác trực quan thời gian thực (tldraw).
*   **Khóa chính (PK)**: `Id` (Guid)
*   **Khóa ngoại (FK)**: `WorkspaceId` -> `Workspaces(Id)`
*   **Các cột chính**:
    *   `Title` (varchar(200), Not Null): Tiêu đề bảng trắng.
    *   `DataJson` (text, Not Null): Dữ liệu tọa độ, nét vẽ hình học lưu ở định dạng chuỗi JSON của tldraw.

---

### PHÂN HỆ 5: COMMUNICATION (Trò chuyện thời gian thực & Thông báo)

#### 29. Bảng `ChatChannels`
Quản lý các phòng chat công cộng, phòng chat riêng tư hoặc hội thoại trực tiếp (Direct Message) trong Workspace.
*   **Khóa chính (PK)**: `Id` (Guid)
*   **Khóa ngoại (FK)**:
    *   `WorkspaceId` -> `Workspaces(Id)`
    *   `CreatedById` -> `Users(Id)`
*   **Các cột chính**:
    *   `Type` (integer, Not Null): Thể loại phòng chat (0: Public, 1: Private, 2: Direct).
    *   `Name` (text, Nullable): Tên kênh chat (e.g., #general, null nếu là chat DM giữa 2 người).
    *   `TaskId` (Guid, Nullable): Liên kết phòng chat trực tiếp phục vụ thảo luận cho một Task cụ thể.
    *   `SelfDestructSeconds` (integer, Nullable): Thời gian đếm ngược tự động xóa tin nhắn sau khi đọc (giây).
    *   `IsDeleted` (boolean, Not Null): Đánh dấu xóa mềm.
    *   `DeletedAt` (timestamp, Nullable): Thời điểm xóa mềm.

#### 30. Bảng `ChatChannelMembers`
Quản lý thông tin thành viên tham gia phòng chat.
*   **Khóa chính liên hợp (Composite PK)**: (`ChannelId`, `UserId`)
*   **Khóa ngoại (FK)**:
    *   `ChannelId` -> `ChatChannels(Id)`
    *   `UserId` -> `Users(Id)`
*   **Các cột chính**:
    *   `JoinedAt` (timestamp, Not Null): Thời điểm vào kênh chat.
    *   `LastReadAt` (timestamp, Nullable): Mốc thời gian cuối cùng xem kênh để tính số lượng tin nhắn chưa đọc.
    *   `IsMuted` (boolean, Not Null): Bật/Tắt tắt tiếng nhận thông báo từ kênh này.
    *   `HiddenAt` (timestamp, Nullable): Thời điểm ẩn kênh chat (thường áp dụng cho ẩn lịch sử hội thoại DM).
    *   `Role` (integer, Not Null): Vai trò quản trị kênh (0: Admin, 1: Member).

#### 31. Bảng `ChatMessages`
Lưu trữ nội dung chi tiết tin nhắn chat của các thành viên.
*   **Khóa chính (PK)**: `Id` (Guid)
*   **Khóa ngoại (FK)**:
    *   `ChannelId` -> `ChatChannels(Id)`
    *   `SenderId` -> `Users(Id)`
    *   `ReplyToId` -> `ChatMessages(Id)` (Restrict - Nullable - Trả lời một tin nhắn cụ thể).
*   **Các cột chính**:
    *   `Content` (text, Not Null): Nội dung tin nhắn.
    *   `Type` (integer, Not Null): Loại tin nhắn (0: Text, 1: System - thông báo hệ thống, 2: File).
    *   `IsEdited` (boolean, Not Null): Tin nhắn đã chỉnh sửa.
    *   `AttachmentUrl` (text, Nullable): Đường dẫn tệp đính kèm gửi trong chat.
    *   `AttachmentName` (text, Nullable): Tên tệp đính kèm gốc.
    *   `AttachmentType` (text, Nullable): Định dạng tệp đính kèm (image/video/file).
    *   `IsDeleted` (boolean, Not Null): Đánh dấu xóa mềm.
    *   `DeletedAt` (timestamp, Nullable): Thời điểm xóa tin nhắn.
    *   `DeleteAfterAt` (timestamp, Nullable): Hạn chót đếm ngược tự động xóa tin nhắn (đối với tin nhắn tự hủy).

#### 32. Bảng `MessageReadReceipts`
Theo dõi trạng thái đã đọc tin nhắn của từng thành viên trong nhóm.
*   **Khóa chính liên hợp (Composite PK)**: (`MessageId`, `UserId`)
*   **Khóa ngoại (FK)**:
    *   `MessageId` -> `ChatMessages(Id)` (Cascade Delete)
    *   `UserId` -> `Users(Id)`
*   **Các cột chính**:
    *   `ReadAt` (timestamp, Not Null): Ngày giờ xem tin nhắn.

#### 33. Bảng `Notifications`
Quản lý các thông báo của người dùng phát sinh trong quá trình hoạt động.
*   **Khóa chính (PK)**: `Id` (Guid)
*   **Khóa ngoại (FK)**:
    *   `UserId` -> `Users(Id)`
    *   `ActorId` -> `Users(Id)` (Nullable - Thành viên thực hiện hành động dẫn đến phát sinh thông báo).
*   **Các cột chính**:
    *   `WorkspaceId` (Guid, Not Null): Không gian làm việc nơi phát sinh thông báo.
    *   `Type` (integer, Not Null): Phân loại sự kiện (e.g., TaskAssigned, Mentioned...).
    *   `Title` (text, Not Null): Tiêu đề thông báo.
    *   `Content` (text, Nullable): Nội dung tóm tắt chi tiết.
    *   `EntityType` (text, Nullable): Tên thực thể liên quan (e.g., Task, Project, Meeting).
    *   `EntityId` (Guid, Nullable): ID thực thể để bấm điều hướng nhanh.
    *   `Channel` (integer, Not Null): Kênh truyền gửi thông báo (0: InApp, 1: Email, 2: Push).
    *   `IsRead` (boolean, Not Null): Đã xem thông báo.
    *   `ReadAt` (timestamp, Nullable): Ngày giờ bấm đọc thông báo.

#### 34. Bảng `ActivityLogs`
Lưu trữ vết nhật ký hoạt động (Audit log) của Workspace phục vụ công tác giám sát hệ thống.
*   **Khóa chính (PK)**: `Id` (Guid)
*   **Khóa ngoại (FK)**: `ActorId` -> `Users(Id)`
*   **Các cột chính**:
    *   `WorkspaceId` (Guid, Not Null): Workspace ghi nhận hành động.
    *   `EntityType` (text, Not Null): Loại đối tượng thay đổi dữ liệu (e.g., Task, Project, Role).
    *   `EntityId` (Guid, Not Null): ID đối tượng.
    *   `Action` (text, Not Null): Hành động (create, update, delete).
    *   `OldValues` (text, Nullable): Dữ liệu JSON cũ trước khi sửa.
    *   `NewValues` (text, Nullable): Dữ liệu JSON mới sau khi sửa.
    *   `Description` (text, Not Null): Mô tả diễn giải dễ đọc cho quản trị viên.

---

### PHÂN HỆ 6: STRATEGY (OKRs - Quản lý Mục tiêu & Kết quả Then chốt)

#### 35. Bảng `Objectives`
Lưu trữ các mục tiêu dài hạn hoặc trung hạn ở cấp độ Workspace hoặc cá nhân.
*   **Khóa chính (PK)**: `Id` (Guid)
*   **Khóa ngoại (FK)**:
    *   `ParentObjectiveId` -> `Objectives(Id)` (Restrict - Nullable - Mục tiêu cha).
    *   `OwnerId` -> `Users(Id)`
*   **Các cột chính**:
    *   `WorkspaceId` (Guid, Not Null): Workspace quản lý OKR.
    *   `Title` (text, Not Null): Tên mục tiêu (e.g., Tăng trưởng doanh thu).
    *   `Description` (text, Nullable): Chi tiết mô tả.
    *   `Period` (text, Nullable): Chu kỳ thiết lập OKR (Q1-2026, H1-2026, 2026).
    *   `Status` (integer, Not Null): Trạng thái (0: Draft, 1: Active, 2: Achieved, 3: Closed).
    *   `Progress` (numeric(5,2), Not Null): Tiến độ hoàn thành mục tiêu (phần trăm).
    *   `StartDate` (timestamp, Nullable): Ngày bắt đầu đo lường mục tiêu.
    *   `EndDate` (timestamp, Nullable): Ngày kết thúc đo lường mục tiêu.

#### 36. Bảng `KeyResults`
Lưu trữ các kết quả then chốt giúp đo lường định lượng tiến trình của mục tiêu (`Objectives`).
*   **Khóa chính (PK)**: `Id` (Guid)
*   **Khóa ngoại (FK)**:
    *   `ObjectiveId` -> `Objectives(Id)`
    *   `OwnerId` -> `Users(Id)`
*   **Các cột chính**:
    *   `Title` (text, Not Null): Nội dung kết quả đo lường cụ thể.
    *   `MetricType` (integer, Not Null): Kiểu định lượng (0: Percentage, 1: Number, 2: Currency).
    *   `StartValue` (numeric(18,4), Not Null): Giá trị ban đầu.
    *   `TargetValue` (numeric(18,4), Not Null): Giá trị mục tiêu cần đạt.
    *   `CurrentValue` (numeric(18,4), Not Null): Giá trị ghi nhận thực tế hiện tại.
    *   `Unit` (text, Nullable): Đơn vị đo lường (USD, khách hàng, %...).
    *   `Progress` (numeric(5,2), Not Null): Tiến độ của kết quả then chốt này.

#### 37. Bảng `KeyResultTaskLinks`
Bảng liên kết tác vụ công việc (`Tasks`) vào kết quả then chốt (Khi hoàn thành task sẽ tự động tăng tiến độ OKR).
*   **Khóa chính (PK)**: `Id` (Guid)
*   **Khóa ngoại (FK)**:
    *   `KeyResultId` -> `KeyResults(Id)`
    *   `TaskId` -> `Tasks(Id)`
*   **Các cột chính**:
    *   `WeightPercent` (numeric, Not Null): Trọng số tác động của task này đến KR (%).

#### 38. Bảng `OKRCheckIns`
Lịch sử ghi nhận các lần cập nhật chỉ số đo lường tiến độ của Kết quả then chốt.
*   **Khóa chính (PK)**: `Id` (Guid)
*   **Khóa ngoại (FK)**:
    *   `KeyResultId` -> `KeyResults(Id)`
    *   `AuthorId` -> `Users(Id)`
*   **Các cột chính**:
    *   `PreviousValue` (numeric(18,4), Not Null): Giá trị đo trước khi cập nhật.
    *   `NewValue` (numeric(18,4), Not Null): Giá trị đo mới ghi nhận.
    *   `Note` (text, Nullable): Ghi chú lý do thay đổi.
    *   `Confidence` (integer, Not Null): Mức độ tự tin đạt được mục tiêu (0: OnTrack, 1: AtRisk, 2: OffTrack).

---

### PHÂN HỆ 7: AI ASSISTANT (Trợ lý ảo AI)

#### 39. Bảng `AIConversations`
Lưu các phiên trò chuyện giữa người dùng và Trợ lý ảo AI.
*   **Khóa chính (PK)**: `Id` (Guid)
*   **Khóa ngoại (FK)**: `UserId` -> `Users(Id)`
*   **Các cột chính**:
    *   `WorkspaceId` (Guid, Not Null): Không gian thảo luận.
    *   `Title` (text, Nullable): Tiêu đề phiên trò chuyện (được tự động sinh từ nội dung câu hỏi đầu).
    *   `Context` (text, Not Null): Ngữ cảnh trò chuyện (chat, task, global).
    *   `ContextEntityId` (Guid, Nullable): ID thực thể ngữ cảnh đi kèm (e.g. ID tác vụ).

#### 40. Bảng `AIMessages`
Nội dung chi tiết các câu hội thoại qua lại trong phiên trò chuyện với AI.
*   **Khóa chính (PK)**: `Id` (Guid)
*   **Khóa ngoại (FK)**: `ConversationId` -> `AIConversations(Id)`
*   **Các cột chính**:
    *   `Role` (integer, Not Null): Vai trò người gửi (0: User, 1: Assistant, 2: System).
    *   `Content` (text, Not Null): Nội dung văn bản câu hỏi/phản hồi.
    *   `ToolCalls` (text, Nullable): Ghi nhận JSON danh sách AI kích hoạt các tool hệ thống.
    *   `TokensUsed` (integer, Not Null): Số lượng token tiêu thụ phục vụ đo lường chi phí.

#### 41. Bảng `AIActionLogs`
Nhật ký ghi nhận các hành động tự động hóa do AI khởi tạo và thi hành trên hệ thống (e.g. tự lập dự án, tạo task).
*   **Khóa chính (PK)**: `Id` (Guid)
*   **Khóa ngoại (FK)**:
    *   `ConversationId` -> `AIConversations(Id)`
    *   `UserId` -> `Users(Id)`
*   **Các cột chính**:
    *   `ActionType` (text, Not Null): Loại hành động thực thi.
    *   `ActionPayload` (text, Nullable): Dữ liệu tham số đầu vào JSON của hành động.
    *   `ActionResult` (text, Nullable): Kết quả phản hồi JSON sau khi chạy xong hành động.
    *   `Status` (integer, Not Null): Trạng thái thực thi (0: Pending, 1: Success, 2: Failed).
    *   `ExecutedAt` (timestamp, Nullable): Thời gian chạy hoàn tất.

---

### PHÂN HỆ 8: ANALYTICS (Theo dõi thời gian & Phân tích)

#### 42. Bảng `TimeEntries`
Lưu trữ nhật ký bấm giờ làm việc cho từng tác vụ của thành viên trong nhóm.
*   **Khóa chính (PK)**: `Id` (Guid)
*   **Khóa ngoại (FK)**:
    *   `UserId` -> `Users(Id)`
    *   `TaskId` -> `Tasks(Id)`
*   **Các cột chính**:
    *   `WorkspaceId` (Guid, Not Null): Không gian tính công làm việc.
    *   `StartTime` (timestamp, Not Null): Thời điểm bắt đầu bấm giờ.
    *   `EndTime` (timestamp, Nullable): Thời điểm dừng bấm giờ.
    *   `DurationMinutes` (integer, Nullable): Thời gian làm thực tế (tính theo phút).
    *   `Note` (text, Nullable): Ghi chú công việc đã làm trong ca bấm giờ.
    *   `IsRunning` (boolean, Not Null): Trạng thái đồng hồ vẫn đang đếm giờ.

#### 43. Bảng `DashboardWidgets`
Lưu trữ cấu hình hiển thị các khối biểu đồ, báo cáo trên Dashboard cá nhân của người dùng.
*   **Khóa chính (PK)**: `Id` (Guid)
*   **Khóa ngoại (FK)**: `UserId` -> `Users(Id)`
*   **Các cột chính**:
    *   `WorkspaceId` (Guid, Not Null): Không gian làm việc hiển thị bảng.
    *   `WidgetType` (integer, Not Null): Loại Widget (e.g., TaskSummary, TimeTracked...).
    *   `Config` (text, Nullable): Cấu hình cài đặt Widget lưu dưới dạng chuỗi JSON.
    *   `PositionX` (integer, Not Null): Tọa độ ngang trên lưới Grid.
    *   `PositionY` (integer, Not Null): Tọa độ dọc trên lưới Grid.
    *   `Width` (integer, Not Null): Chiều rộng khối (mặc định 4).
    *   `Height` (integer, Not Null): Chiều cao khối (mặc định 3).

#### 44. Bảng `AnalyticsSnapshots`
Lưu trữ ảnh chụp dữ liệu thống kê định kỳ giúp tối ưu hóa thời gian tải báo cáo phân tích.
*   **Khóa chính (PK)**: `Id` (Guid)
*   **Các cột chính**:
    *   `WorkspaceId` (Guid, Not Null): Không gian làm việc.
    *   `MetricType` (text, Not Null): Phân loại số liệu báo cáo thống kê.
    *   `Data` (text, Not Null): Dữ liệu thống kê dạng chuỗi JSON (mặc định `{}`).
    *   `SnapshotDate` (date, Not Null): Ngày lưu trữ dữ liệu chụp.
    *   `Period` (integer, Not Null): Chu kỳ chụp dữ liệu (0: Daily, 1: Weekly, 2: Monthly).

#### 45. Bảng `WorkloadSummaries`
Thống kê hiệu suất khối lượng công việc hàng ngày của từng thành viên phục vụ báo cáo quản trị.
*   **Khóa chính (PK)**: `Id` (Guid)
*   **Khóa ngoại (FK)**: `UserId` -> `Users(Id)`
*   **Các cột chính**:
    *   `WorkspaceId` (Guid, Not Null): Không gian tính báo cáo.
    *   `PeriodDate` (date, Not Null): Ngày báo cáo ghi nhận.
    *   `TotalTasks` (integer, Not Null): Tổng số tác vụ được giao trong ngày.
    *   `CompletedTasks` (integer, Not Null): Số tác vụ hoàn thành trong ngày.
    *   `OverdueTasks` (integer, Not Null): Số tác vụ bị trễ hạn.
    *   `TotalMinutesTracked` (integer, Not Null): Tổng thời gian bấm giờ ghi nhận được trong ngày.
    *   `EstimatedMinutesRemaining` (integer, Not Null): Số thời gian ước lượng còn lại để xong việc.
    *   `CompletionRate` (numeric(5,2), Not Null): Tỷ lệ hoàn thành công việc (%).
    *   `CalculatedAt` (timestamp, Not Null): Thời gian tính toán lần cuối.

---

### PHÂN HỆ PHỤ: METADATA & MIGRATIONS SYSTEM

#### 46. Bảng `__EFMigrationsHistory`
Bảng hệ thống mặc định được EF Core tự tạo trong cơ sở dữ liệu PostgreSQL để theo dõi lịch sử và phiên bản các Migration đã áp dụng.
*   **Khóa chính (PK)**: `MigrationId` (varchar(150))
*   **Các cột chính**:
    *   `ProductVersion` (varchar(32), Not Null): Phiên bản Entity Framework Core sử dụng tại thời điểm thực thi di chuyển dữ liệu (e.g. `9.0.x`).

---

## 5. CƠ CHẾ AI HỖ TRỢ THỰC THI NHIỆM VỤ (AI ACTION EXECUTION & INTEGRATION)

Hệ thống Pulse được tích hợp một trợ lý ảo AI có khả năng tương tác trực quan và tự động hóa các hành động quản trị, quản lý dự án trực tiếp trên hệ thống thông qua việc kết hợp giữa **PicoClaw MCP (Model Context Protocol) Server** và bộ thực thi hành động **AIActionExecutor**.

---

### A. Luồng Xử Lý Yêu Cầu & Kích Hoạt Hành Động (Execution Pipeline)

Khi người dùng gửi tin nhắn trò chuyện với AI tại phòng chat trợ lý ảo, luồng dữ liệu và thực thi diễn ra theo các bước sau:

1.  **Tiếp nhận Yêu cầu (Request Reception)**: Phía client gửi yêu cầu thông qua API `POST /api/workspaces/{workspaceSlug}/ai/conversations` (bắt đầu hội thoại) hoặc `POST /api/workspaces/{workspaceSlug}/ai/conversations/{id}/messages` (gửi tin nhắn tiếp theo). Yêu cầu này được tiếp nhận bởi [AIAssistantController.cs](file:///c:/Users/legen/Documents/GitHub/Pulse/Pulse_be/src/Pulse.API/Controllers/AIAssistantController.cs).
2.  **Thu thập Ngữ cảnh Không gian làm việc (Context Gathering)**: Controller gọi hàm `BuildWorkspaceContextAsync` để truy vấn thông tin thời gian thực từ cơ sở dữ liệu nhằm tạo một bức tranh toàn cảnh về không gian làm việc hiện tại của người dùng.
3.  **Gửi yêu cầu tới PicoClaw MCP Server (PicoClaw Request)**: Hệ thống sử dụng [PicoClawService.cs](file:///c:/Users/legen/Documents/GitHub/Pulse/Pulse_be/src/Pulse.API/Services/PicoClawService.cs) để chuyển tiếp tin nhắn của người dùng cùng với toàn bộ dữ liệu ngữ cảnh thu thập được sang dịch vụ PicoClaw MCP Server với action `"analyze_task"`.
4.  **Phân tích & Phản hồi (Analysis & Core Response)**: PicoClaw MCP Server xử lý dữ liệu và trả về một cấu trúc phản hồi gồm:
    *   `Content`: Nội dung câu trả lời/phản hồi dạng văn bản.
    *   `Actions`: Một mảng các hành động có cấu trúc dạng JSON biểu diễn các thao tác hệ thống cần thực hiện (ví dụ: tạo công việc, lên lịch họp).
5.  **Trích xuất Hành động Dự phòng (Fallback Action Extraction)**: Trong trường hợp PicoClaw không trả về hành động dạng cấu trúc mà trả về trực tiếp định dạng JSON nằm trong nội dung text (ví dụ: các khối mã ` ```json `), `AIAssistantController` sẽ sử dụng hàm trợ giúp `ExtractActionsFromText` để trích xuất các hành động này.
6.  **Thực thi Hành động (Action Execution)**: Bộ thực thi [AIActionExecutor.cs](file:///c:/Users/legen/Documents/GitHub/Pulse/Pulse_be/src/Pulse.API/Services/AIActionExecutor.cs) (`IAIActionExecutor`) sẽ duyệt qua danh sách hành động, thực hiện gọi các phương thức tương tác trực tiếp với cơ sở dữ liệu thông qua Entity Framework Core (`ApplicationDbContext`), và lưu lại kết quả thực thi.
7.  **Lưu nhật ký & Phản hồi cho Người dùng (Logging & User Feedback)**: 
    *   Mỗi hành động được thực thi sẽ được lưu vết vào bảng `AIActionLogs` để phục vụ giám sát và kiểm tra lịch sử.
    *   Các kết quả thực thi (thành công/thất bại kèm thông tin chi tiết) được định dạng lại và chèn thêm vào cuối tin nhắn phản hồi của AI trợ lý dưới dạng danh sách hành động đã thực thi (`Executed Actions`) trước khi lưu vào bảng `AIMessages` và trả về giao diện người dùng.

---

### B. Cơ Chế Thu Thập Ngữ Cảnh (Workspace Context Structure)

Để trợ lý AI có đầy đủ thông tin hỗ trợ người dùng mà không cần hỏi lại nhiều lần, hàm `BuildWorkspaceContextAsync` sẽ biên soạn một tập tin ngữ cảnh (Context Payload) chi tiết dạng JSON gửi kèm mỗi yêu cầu:

*   **Workspace Context (`workspace`)**: Tên không gian làm việc (`Name`), đường dẫn slug (`Slug`), gói dịch vụ (`Plan`), và tổng số lượng thành viên (`MemberCount`).
*   **User Context (`user`)**: Thông tin chi tiết của người đang yêu cầu bao gồm Tên (`FirstName`), Họ (`LastName`), Email (`Email`), và Vai trò của họ trong Workspace (`Role` - ví dụ: Admin, Member).
*   **My Tasks (`myTasks`)**: Danh sách tối đa 15 công việc đang được giao cho người dùng này có trạng thái chưa hoàn thành hoặc chưa hủy (`Status != Done && Status != Cancelled`), sắp xếp giảm dần theo độ ưu tiên (`Priority`) kèm thông tin dự án liên quan và hạn chót (`Deadline`).
*   **Projects (`projects`)**: Danh sách các dự án trong Workspace kèm số liệu tiến độ trực quan (tổng số task, số task đã xong, số task đang làm).
*   **Upcoming Meetings (`upcomingMeetings`)**: Danh sách tối đa 5 cuộc họp đã lên lịch trong vòng 7 ngày tới.
*   **Whiteboards (`whiteboards` & `currentBoard`)**: Danh sách các bảng vẽ cộng tác hiện có và thông tin bảng vẽ hiện tại mà người dùng đang thao tác.

---

### C. Các Hành Động AI Được Hỗ Trợ (Supported AI Actions)

Bộ thực thi `AIActionExecutor` chịu trách nhiệm ánh xạ các hành động của AI thành các truy vấn và thay đổi dữ liệu trong hệ thống thông qua Entity Framework Core:

1.  **Tạo công việc mới (`create_task`)**:
    *   *Tham số*: `title`, `projectName`, `priority`, `status`, `description`.
    *   *Xử lý*: Tìm kiếm dự án (`Project`) phù hợp trong Workspace bằng tên dự án (sử dụng so sánh không phân biệt chữ hoa chữ thường `ILIKE` và tìm kiếm tương đối). Nếu tìm thấy, tạo một bản ghi `TaskItem` mới, tự động thiết lập vị trí (`Position`) ở cuối danh sách, và mặc định gán công việc (`TaskAssignee`) cho chính người dùng vừa gửi yêu cầu.
2.  **Tạo dự án mới (`create_project`)**:
    *   *Tham số*: `name`, `description`, `color`.
    *   *Xử lý*: Tạo một bản ghi `Project` mới trong Workspace với trạng thái mặc định là hoạt động (`Active`).
3.  **Lên lịch cuộc họp (`create_meeting`)**:
    *   *Tham số*: `title`, `description`, `startTime`, `endTime`.
    *   *Xử lý*: Tạo cuộc họp mới (`Meeting`), tự động thiết lập thời gian đề xuất mặc định (nếu AI không chỉ định rõ), gắn người tạo làm người tổ chức (`OrganizerId`) và tự động thêm họ vào danh sách tham gia cuộc họp (`MeetingParticipant`).
4.  **Tạo mục tiêu OKRs (`create_objective`)**:
    *   *Tham số*: `title`, `description`, `period`.
    *   *Xử lý*: Tạo mục tiêu OKRs mới (`Objective`) cấp Workspace hoặc cá nhân. Tự động tính chu kỳ hiện tại (ví dụ: `Q3-2026`) nếu tham số `period` bị thiếu, đồng thời thiết lập thời hạn mặc định trong vòng 3 tháng kể từ thời điểm tạo.
5.  **Thiết lập khối thời gian lập kế hoạch (`create_planner_block`)**:
    *   *Tham số*: `title`, `startTime`, `endTime`.
    *   *Xử lý*: Thêm một khối thời gian cá nhân (`PlannerBlock`) loại `Personal` vào lịch trình Planner của người dùng để hỗ trợ lập kế hoạch công việc theo giờ (Time Blocking).
6.  **Cập nhật thông tin công việc (`update_task`)**:
    *   *Tham số*: `taskTitle`, `status`, `priority`.
    *   *Xử lý*: Tìm kiếm công việc (`TaskItem`) dựa trên một phần tiêu đề (`taskTitle`). Nếu tìm thấy, tiến hành cập nhật trạng thái (`Status`) hoặc độ ưu tiên (`Priority`) tương ứng. Đặc biệt, nếu chuyển đổi trạng thái thành `Done`, hệ thống sẽ tự động cập nhật thời điểm hoàn thành `CompletedAt` bằng giờ hệ thống UTC hiện tại.

