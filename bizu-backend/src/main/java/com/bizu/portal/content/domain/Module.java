package com.bizu.portal.content.domain;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "modules", schema = "content")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Module {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "order_index")
    private Integer orderIndex;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    @com.fasterxml.jackson.annotation.JsonBackReference
    private Course course;
}
